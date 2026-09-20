import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import api from '../lib/api';
import { FileText, HelpCircle, MessageSquare, Send, RefreshCw, Link2, BookOpen } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import MessageThread from '../components/MessageThread';

export default function DocumentDetail({ role }) {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for Q&A
  const [newQuestion, setNewQuestion] = useState('');
  const userId = localStorage.getItem('userId');

  const fetchDoc = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      setDoc(res.data);
    } catch {
      console.log("Backend not ready, using mock data");
      const mockDocs = [
        { id: '1', title: 'Indian Passport', description: 'Apply for a new or renewed Indian Passport.', steps: '1. Register on Passport Seva Online Portal\n2. Fill the application form\n3. Pay the fee and book appointment\n4. Visit the Passport Seva Kendra (PSK)', updateSteps: "1. Log in to the Passport Seva portal and select 'Reissue of Passport'\n2. Fill the reissue form for changes (address, name, expiry renewal)\n3. Pay the fee and schedule an appointment at the PSK\n4. Submit original passport and supporting documents", requiredDocs: 'Aadhaar Card, Date of Birth proof, Non-ECR proof (if applicable)', officialLink: 'https://www.passportindia.gov.in/', sources: 'Passport Seva Official Portal|https://www.passportindia.gov.in/\nMinistry of External Affairs|https://www.mea.gov.in/', guides: 'Passport Seva Help & FAQs|https://www.passportindia.gov.in/', questions: [ { id: 'q1', content: 'What documents are required for address proof if I am staying on rent?', messages: [] } ] },
        { id: '2', title: 'Aadhar Card', description: 'Enroll for a new Aadhar card or update your existing details.', steps: '1. Locate nearest Aadhar center\n2. Book an appointment online\n3. Provide biometric and demographic data at the center', updateSteps: '1. Visit an Aadhaar Seva Kendra or the UIDAI Self-Service Update Portal (SSUP)\n2. Select the field to update\n3. Upload supporting documents\n4. Pay the nominal update fee where applicable', requiredDocs: 'Proof of Identity, Proof of Address, Date of Birth proof', officialLink: 'https://uidai.gov.in/', sources: 'UIDAI Official Portal|https://uidai.gov.in/\nAadhaar Self-Service Update Portal|https://ssup.uidai.gov.in/', guides: 'UIDAI FAQs & Help Center|https://uidai.gov.in/', questions: [] },
        { id: '3', title: 'PAN Card', description: 'Apply for a Permanent Account Number for financial transactions.', steps: '1. Fill Form 49A on NSDL/UTIITSL\n2. Upload digital documents\n3. Pay the processing fee online', updateSteps: "1. Visit NSDL/UTIITSL and select 'Changes or Correction in PAN Data'\n2. Fill the correction form\n3. Upload proof for the field being changed\n4. Pay the correction fee online", requiredDocs: 'Aadhaar Card, Passport size photos, Address proof', officialLink: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html', sources: 'NSDL e-Gov PAN Services|https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html\nUTIITSL PAN Services|https://www.pan.utiitsl.com/', guides: 'Income Tax e-Filing Portal|https://www.incometax.gov.in/', questions: [] }
      ];

      const found = mockDocs.find(d => d.id === id);

      // Simulate checking local storage for new questions if backend is offline
      const localQuestions = JSON.parse(localStorage.getItem(`questions_${id}`) || '[]');
      if (found) {
        // Merge mock questions and locally saved questions
        found.questions = [...found.questions.filter(mq => !localQuestions.find(lq => lq.id === mq.id)), ...localQuestions];
      }
      setDoc(found);
    }
    setLoading(false);
  };

  // fetchDoc is intentionally defined at component scope so ask/reply/close handlers can reuse it for refetching;
  // it's redefined every render but only depends on `id`, so re-running the effect on `id` change alone is correct.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!role) return <Navigate to="/" />;

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      await api.post('/questions', { documentId: id, content: newQuestion });
      fetchDoc(); // Refresh
    } catch (err) {
      if (err.response) {
        alert(err.response.data?.error || 'Failed to post question');
        setNewQuestion('');
        return;
      }
      // Backend unreachable - mock save to local storage
      const currentQuestions = JSON.parse(localStorage.getItem(`questions_${id}`) || '[]');
      const q = { id: Date.now().toString(), content: newQuestion, userId, messages: [] };
      const newQuestions = [...currentQuestions, q];
      localStorage.setItem(`questions_${id}`, JSON.stringify(newQuestions));

      // Update UI immediately
      setDoc(prev => ({ ...prev, questions: [...(prev.questions || []), q] }));
    }
    setNewQuestion('');
  };

  const handleSendMessage = async (questionId, content) => {
    try {
      await api.post('/messages', { questionId, content });
      fetchDoc(); // Refresh
    } catch (err) {
      if (err.response) {
        alert(err.response.data?.error || 'Failed to send message');
        return;
      }
      // Backend unreachable - mock message save to local storage
      const currentQuestions = JSON.parse(localStorage.getItem(`questions_${id}`) || '[]');
      const localQIndex = currentQuestions.findIndex(q => q.id === questionId);

      const newMessage = { id: Date.now().toString(), content, authorRole: role, author: { name: localStorage.getItem('name') } };

      if (localQIndex > -1) {
        currentQuestions[localQIndex].messages.push(newMessage);
        localStorage.setItem(`questions_${id}`, JSON.stringify(currentQuestions));
      } else {
        // If question was from the hardcoded mock data, we need to copy it to local storage first
        const hardcodedQ = doc.questions.find(q => q.id === questionId);
        if (hardcodedQ) {
            const newQ = { ...hardcodedQ, messages: [newMessage] };
            localStorage.setItem(`questions_${id}`, JSON.stringify([...currentQuestions, newQ]));
        }
      }

      // Update UI immediately
      setDoc(prev => ({
        ...prev,
        questions: prev.questions.map(q => {
          if (q.id === questionId) {
            return { ...q, messages: [...(q.messages || []), newMessage] };
          }
          return q;
        })
      }));
    }
  };

  const handleCloseChat = async (questionId) => {
    try {
      await api.patch(`/questions/${questionId}/close`);
      fetchDoc();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close conversation');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading document...</div>;
  if (!doc) return <div style={{ textAlign: 'center', padding: '3rem' }}>Document not found</div>;

  const parseLinks = (raw) => (raw || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [label, url] = line.split('|').map(s => s.trim());
      return { label, url: url || label };
    });

  const sources = parseLinks(doc.sources);
  const guides = parseLinks(doc.guides);

  return (
    <div className="animate-fade-in grid grid-cols-2">
      {/* Left Column: Document Info */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#047857' }}>{doc.title}</h1>
        <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          {doc.description}
        </p>

        {doc.requiredDocs && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} /> Required Documents Checklist
            </h3>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8', color: 'var(--text-color)' }}>
                {doc.requiredDocs.split(',').map((item, index) => (
                  <li key={index}>{item.trim()}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} color="#059669" /> How to Create / Apply
        </h3>
        <div style={{ background: 'var(--soft-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--card-border)', marginBottom: '2.5rem' }}>
          {doc.steps.split('\n').map((step, index) => (
            <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: index < doc.steps.split('\n').length - 1 ? '1px solid var(--card-border)' : 'none' }}>
              {step}
            </div>
          ))}
        </div>

        {doc.updateSteps && (
          <>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={20} color="#047857" /> How to Update / Renew
            </h3>
            <div style={{ background: 'rgba(4, 120, 87, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(4, 120, 87, 0.2)', marginBottom: '2.5rem' }}>
              {doc.updateSteps.split('\n').map((step, index) => (
                <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: index < doc.updateSteps.split('\n').length - 1 ? '1px solid rgba(4, 120, 87, 0.15)' : 'none' }}>
                  {step}
                </div>
              ))}
            </div>
          </>
        )}

        {sources.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link2 size={20} color="#059669" /> Official Sources
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#047857', fontWeight: 500, textDecoration: 'none', padding: '0.5rem 0' }}>
                  {s.label} →
                </a>
              ))}
            </div>
          </div>
        )}

        {guides.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#059669" /> Guides & Resources
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {guides.map((g, i) => (
                <a key={i} href={g.url} target="_blank" rel="noopener noreferrer" style={{ color: '#047857', fontWeight: 500, textDecoration: 'none', padding: '0.5rem 0' }}>
                  {g.label} →
                </a>
              ))}
            </div>
          </div>
        )}

        {doc.officialLink && (
          <a href={doc.officialLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '1.25rem', marginTop: '1rem', fontSize: '1.125rem', fontWeight: 600, textDecoration: 'none' }}>
            Apply on Official Government Portal
          </a>
        )}
      </div>

      {/* Right Column: Q&A Section */}
      <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
          <HelpCircle color="#047857" size={28} />
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Community Q&A</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {(!doc.questions || doc.questions.length === 0) ? (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: '#5b7a6d' }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            doc.questions.map(q => (
              <div key={q.id} style={{ padding: '1.25rem', background: 'var(--soft-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <MessageSquare size={20} color="#059669" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                    <p style={{ fontWeight: 500, margin: 0, lineHeight: '1.5' }}>{q.content}</p>
                  </div>
                  {q.status && <StatusBadge question={q} />}
                </div>

                <MessageThread question={q} currentUserId={userId} currentRole={role} onSend={handleSendMessage} onClose={handleCloseChat} />
              </div>
            ))
          )}
        </div>

        {/* User Question Box */}
        {role === 'user' && (
          <div style={{ marginTop: 'auto', background: 'var(--soft-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="#059669" />
              Have a question?
            </h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                className="input-field"
                placeholder="E.g. What if I don't have an address proof?"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
              />
              <button className="btn btn-primary" onClick={handleAskQuestion}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
