import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';
import { Inbox, CheckCircle2 } from 'lucide-react';
import MessageThread from '../components/MessageThread';
import DocumentBadge from '../components/DocumentBadge';

export default function MyTickets({ role }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/questions/mine');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch my tickets', err);
    }
    setLoading(false);
  };

  // fetchTickets is intentionally defined at component scope so send/close handlers can reuse it for refetching.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTickets(); }, []);

  if (!role) return <Navigate to="/" />;
  if (role !== 'admin' && role !== 'superadmin') return <Navigate to="/dashboard" />;

  const handleSendMessage = async (questionId, content) => {
    try {
      await api.post('/messages', { questionId, content });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleClose = async (questionId) => {
    try {
      await api.patch(`/questions/${questionId}/close`);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close conversation');
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
              <div style={{ marginBottom: '0.75rem' }}><DocumentBadge question={q} /></div>
              <p style={{ fontWeight: 500, margin: '0 0 0.25rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{q.content}</p>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0 0 1rem' }}>Asked by {q.user?.name || 'a citizen'}</p>

              <MessageThread question={q} currentUserId={userId} currentRole={role} onSend={handleSendMessage} onClose={handleClose} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
