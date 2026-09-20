import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';
import { Ticket, AlertTriangle, Clock } from 'lucide-react';
import MessageThread from '../components/MessageThread';
import DocumentBadge from '../components/DocumentBadge';

export default function PendingQueue({ role }) {
  const [unassigned, setUnassigned] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  const fetchAll = async () => {
    try {
      const [pendingRes, adminsRes] = await Promise.all([
        api.get('/questions/pending'),
        api.get('/admins'),
      ]);
      setUnassigned(pendingRes.data.unassigned);
      setInProgress(pendingRes.data.inProgress);
      setAdmins(adminsRes.data);
    } catch (err) {
      console.error('Failed to fetch pending queue', err);
    }
    setLoading(false);
  };

  // fetchAll is intentionally defined at component scope so assign/send/close handlers can reuse it for refetching.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, []);

  if (!role) return <Navigate to="/" />;
  if (role !== 'superadmin') return <Navigate to="/dashboard" />;

  const handleAssign = async (questionId, adminId) => {
    try {
      await api.patch(`/questions/${questionId}/assign`, { adminId: adminId || null });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign ticket');
    }
  };

  const handleSendMessage = async (questionId, content) => {
    try {
      await api.post('/messages', { questionId, content });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleClose = async (questionId) => {
    try {
      await api.patch(`/questions/${questionId}/close`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close conversation');
    }
  };

  const TicketCard = ({ q, accent }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${accent}` }}>
      <div style={{ marginBottom: '0.75rem' }}><DocumentBadge question={q} /></div>
      <p style={{ fontWeight: 500, margin: '0 0 0.25rem', lineHeight: '1.5' }}>{q.content}</p>
      <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0 0 1rem' }}>
        Asked by {q.user?.name || 'a citizen'} · {q.assignedTo ? `Assigned to ${q.assignedTo.name}` : 'Not assigned to anyone'}
      </p>

      <select
        className="input-field"
        style={{ width: 'auto', minWidth: '220px', padding: '0.5rem 0.75rem', marginBottom: '1rem', display: 'block' }}
        value={q.assignedToId || ''}
        onChange={e => handleAssign(q.id, e.target.value)}
      >
        <option value="">Unassigned</option>
        {admins.map(a => (
          <option key={a.id} value={a.id}>
            {a.name} {a.role === 'superadmin' ? '(You/SuperAdmin)' : a.isAvailable ? '(Available)' : '(Offline)'}
          </option>
        ))}
      </select>

      <MessageThread question={q} currentUserId={userId} currentRole={role} onSend={handleSendMessage} onClose={handleClose} />
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading pending queue...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Ticket color="#059669" size={28} />
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Pending Queue</h1>
      </div>
      <p className="text-muted" style={{ marginBottom: '2.5rem' }}>
        Every open ticket in the system — assign, reassign, or answer directly so nothing gets neglected.
      </p>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c' }}>
          <AlertTriangle size={20} /> Unassigned — No Admin Was Available ({unassigned.length})
        </h2>
        {unassigned.length === 0 ? (
          <p className="text-muted">Nothing unassigned right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {unassigned.map(q => <TicketCard key={q.id} q={q} accent="#ef4444" />)}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
          <Clock size={20} /> In Progress — Assigned, Awaiting Answer ({inProgress.length})
        </h2>
        {inProgress.length === 0 ? (
          <p className="text-muted">Nothing in progress right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {inProgress.map(q => <TicketCard key={q.id} q={q} accent="#f59e0b" />)}
          </div>
        )}
      </div>
    </div>
  );
}
