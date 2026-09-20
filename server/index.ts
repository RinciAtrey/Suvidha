import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET as string;

app.use(cors());
app.use(express.json());

// --- Auth helpers ---
interface AuthedRequest extends express.Request {
  user?: { id: string; role: string; name: string };
}

function authenticate(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string; name: string };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }
    next();
  };
}

const questionInclude = {
  document: { select: { id: true, title: true } },
  user: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
  messages: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' as const } },
};

// Picks the least-busy available admin for a new ticket, or null if nobody is available.
async function pickAvailableAdmin() {
  const availableAdmins = await prisma.user.findMany({ where: { role: 'admin', isAvailable: true } });
  if (availableAdmins.length === 0) return null;

  const loads = await Promise.all(availableAdmins.map(async admin => ({
    admin,
    openCount: await prisma.question.count({ where: { assignedToId: admin.id, status: 'assigned' } }),
  })));

  loads.sort((a, b) => a.openCount - b.openCount);
  return loads[0].admin;
}

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!email || !password || !name) return res.status(400).json({ error: 'Name, email, and password required' });

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user'; // superadmin is never self-service

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: userRole }
    });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, id: user.id, role: user.role, email: user.email, name: user.name, isAvailable: user.isAvailable });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, id: user.id, role: user.role, email: user.email, name: user.name, isAvailable: user.isAvailable });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Toggle own availability (admin/superadmin). Coming back online auto-claims the oldest queued ticket.
app.patch('/api/users/availability', authenticate, requireRole('admin', 'superadmin'), async (req: AuthedRequest, res) => {
  const { isAvailable } = req.body;
  try {
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: { isAvailable: !!isAvailable } });

    let claimed = null;
    if (isAvailable && req.user!.role === 'admin') {
      const oldestPending = await prisma.question.findFirst({ where: { status: 'unassigned' }, orderBy: { createdAt: 'asc' } });
      if (oldestPending) {
        claimed = await prisma.question.update({
          where: { id: oldestPending.id },
          data: { status: 'assigned', assignedToId: user.id },
          include: questionInclude,
        });
      }
    }

    res.json({ id: user.id, isAvailable: user.isAvailable, claimed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// List admins/superadmins (for the superadmin reassignment panel)
app.get('/api/admins', authenticate, requireRole('superadmin'), async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'superadmin'] } },
      select: { id: true, name: true, email: true, role: true, isAvailable: true },
      orderBy: { name: 'asc' },
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// --- Document Routes ---
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await prisma.document.findMany();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { questions: { include: questionInclude, orderBy: { createdAt: 'desc' } } },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// --- Scheme Routes ---
app.get('/api/schemes', async (req, res) => {
  try {
    const schemes = await prisma.scheme.findMany({ orderBy: { name: 'asc' } });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// Rule-based eligibility check, fail-closed: if a scheme restricts a dimension (age, gender,
// income, occupation, social category, student status), the user must have supplied a matching
// value or that scheme is excluded. Dimensions the scheme doesn't restrict are open to everyone.
app.post('/api/schemes/eligible', async (req, res) => {
  const { age, gender, income, occupation, socialCategory, isStudent } = req.body;

  try {
    const schemes = await prisma.scheme.findMany();

    const matches = schemes.filter(s => {
      if (s.minAge != null || s.maxAge != null) {
        const numAge = Number(age);
        if (age === undefined || age === null || age === '' || Number.isNaN(numAge)) return false;
        if (s.minAge != null && numAge < s.minAge) return false;
        if (s.maxAge != null && numAge > s.maxAge) return false;
      }
      if (s.gender && gender !== s.gender) return false;
      if (s.maxIncome != null) {
        const numIncome = Number(income);
        if (income === undefined || income === null || income === '' || Number.isNaN(numIncome)) return false;
        if (numIncome > s.maxIncome) return false;
      }
      if (s.occupation) {
        const allowed = s.occupation.split(',').map((o: string) => o.trim().toLowerCase());
        if (!occupation || !allowed.includes(String(occupation).toLowerCase())) return false;
      }
      if (s.socialCategory) {
        const allowed = s.socialCategory.split(',').map((c: string) => c.trim().toLowerCase());
        if (!socialCategory || !allowed.includes(String(socialCategory).toLowerCase())) return false;
      }
      if (s.isStudent === true && isStudent !== true) return false;
      return true;
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// --- Question / Ticket Routes ---

// Community panel: every question across every document, visible to any logged-in role
app.get('/api/questions', authenticate, async (req, res) => {
  try {
    const questions = await prisma.question.findMany({ include: questionInclude, orderBy: { createdAt: 'desc' } });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Tickets assigned to the logged-in admin/superadmin that still need an answer
app.get('/api/questions/mine', authenticate, requireRole('admin', 'superadmin'), async (req: AuthedRequest, res) => {
  try {
    const questions = await prisma.question.findMany({
      where: { assignedToId: req.user!.id, status: 'assigned' },
      include: questionInclude,
      orderBy: { createdAt: 'asc' },
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your tickets' });
  }
});

// Superadmin-only backlog view: unassigned tickets + everything still open
app.get('/api/questions/pending', authenticate, requireRole('superadmin'), async (req, res) => {
  try {
    const [unassigned, inProgress] = await Promise.all([
      prisma.question.findMany({ where: { status: 'unassigned' }, include: questionInclude, orderBy: { createdAt: 'asc' } }),
      prisma.question.findMany({ where: { status: 'assigned' }, include: questionInclude, orderBy: { createdAt: 'asc' } }),
    ]);
    res.json({ unassigned, inProgress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending queue' });
  }
});

// Ask a question - auto-assigned to the least-busy available admin, or left "unassigned" if nobody is free
app.post('/api/questions', authenticate, async (req: AuthedRequest, res) => {
  const { documentId, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Question content required' });

  try {
    const admin = await pickAvailableAdmin();

    const question = await prisma.question.create({
      data: {
        content,
        documentId,
        userId: req.user!.id,
        status: admin ? 'assigned' : 'unassigned',
        assignedToId: admin?.id,
      },
      include: questionInclude,
    });

    res.json(question);
  } catch (error) {
    console.error('Post question error:', error);
    res.status(500).json({ error: 'Failed to post question' });
  }
});

// Superadmin reassigns/assigns a ticket to a specific admin (or unassigns with adminId: null)
app.patch('/api/questions/:id/assign', authenticate, requireRole('superadmin'), async (req, res) => {
  const { adminId } = req.body;
  try {
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: { assignedToId: adminId || null, status: adminId ? 'assigned' : 'unassigned' },
      include: questionInclude,
    });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reassign ticket' });
  }
});

// Post a message in a question's conversation thread - the asker, the assigned admin, or any
// superadmin may post at any time. The thread never locks: an admin reply marks it "answered",
// and a further reply from the citizen re-opens it (back to "assigned") so it resurfaces for the admin.
app.post('/api/messages', authenticate, async (req: AuthedRequest, res) => {
  const { questionId, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message content required' });

  try {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const { id: userId, role } = req.user!;
    const isAsker = question.userId === userId;
    const isAssignedAdmin = role === 'admin' && question.assignedToId === userId;
    const isSuperadmin = role === 'superadmin';

    if (!isAsker && !isAssignedAdmin && !isSuperadmin) {
      return res.status(403).json({ error: 'You are not part of this conversation' });
    }

    const message = await prisma.message.create({
      data: { content, questionId, authorId: userId, authorRole: role },
      include: { author: { select: { id: true, name: true } } },
    });

    if (role === 'admin' || role === 'superadmin') {
      await prisma.question.update({
        where: { id: questionId },
        data: { status: 'answered', assignedToId: question.assignedToId ?? userId },
      });
    } else if (question.status === 'answered') {
      await prisma.question.update({ where: { id: questionId }, data: { status: 'assigned' } });
    }

    res.json(message);
  } catch (error) {
    console.error('Post message error:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
