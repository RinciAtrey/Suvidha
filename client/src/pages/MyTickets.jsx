import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../lib/api';
import { Inbox, FileText, CheckCircle2 } from 'lucide-react';
import MessageThread from '../components/MessageThread';

export default function MyTickets({ role }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  if (!role) return <Navigate to="/" />;
  if (role !== 'admin' && role !== 'superadmin') return <Navigate to="/dashboard" />;

  const fetchTickets = async () => {
    try {
      const res = await api.get('/questions/mine');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch my tickets', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSendMessage = async (questionId, content) => {
    try {
      await api.post('/messages', { questionId, content });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your tickets...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Inbox color="#059669" size={28} />
        <h1 style={{ margin: 0, fontSize: '2rem' }}>My Tickets</h1>
      </div>
      <p className="text-muted" style={{ marginBottom: '2.5rem' }}>
        Questions assigned to you awaiting a reply — including citizens following up on a previous answer.
      </p>

      {tickets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#059669" style={{ opacity: 0.4, marginBottom: '1rem' }} />
          <p className="text-muted">You're all caught up — no open tickets assigned to you.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {tickets.map(q => (
            <div key={q.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
              <Link to={`/document/${q.documentId}`} className="badge" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                <FileText size={12} /> {q.document?.title}
              </Link>
              <p style={{ fontWeight: 500, margin: '0 0 0.25rem', lineHeight: '1.5' }}>{q.content}</p>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0 0 1rem' }}>Asked by {q.user?.name || 'a citizen'}</p>

              <MessageThread question={q} currentUserId={userId} currentRole={role} onSend={handleSendMessage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
