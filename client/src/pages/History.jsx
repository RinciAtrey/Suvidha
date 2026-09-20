import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';
import { History as HistoryIcon, Archive } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import MessageThread from '../components/MessageThread';
import DocumentBadge from '../components/DocumentBadge';

export default function History({ role }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    api.get('/questions/history')
      .then(res => setQuestions(res.data))
      .catch(err => console.error('Failed to fetch history', err))
      .finally(() => setLoading(false));
  }, []);

  if (!role) return <Navigate to="/" />;
  if (role !== 'admin' && role !== 'superadmin') return <Navigate to="/dashboard" />;

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading history...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <HistoryIcon color="#059669" size={28} />
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Conversation History</h1>
      </div>
      <p className="text-muted" style={{ marginBottom: '2.5rem' }}>
        Every closed conversation, with a full record of who asked, who handled it, and who closed it.
      </p>

      {questions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Archive size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p className="text-muted">No conversations have been closed yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.map(q => (
            <div key={q.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ marginBottom: '0.5rem' }}><DocumentBadge question={q} /></div>
                  <p style={{ fontWeight: 500, margin: '0.5rem 0 0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{q.content}</p>
                  <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                    Asked by {q.user?.name || 'a citizen'} · Handled by {q.assignedTo?.name || 'nobody'} · Closed by {q.closedBy?.name || 'staff'}
                    {q.closedBy?.role === 'superadmin' ? ' (Super Admin)' : q.closedBy?.role === 'admin' ? ' (Government Official)' : ''}
                    {q.closedAt ? ` on ${new Date(q.closedAt).toLocaleString()}` : ''}
                  </p>
                </div>
                <StatusBadge question={q} />
              </div>

              <MessageThread question={q} currentUserId={userId} currentRole={role} onSend={() => {}} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
