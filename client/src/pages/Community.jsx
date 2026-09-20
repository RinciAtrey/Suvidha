import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';
import { Users, MessageSquare } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import MessageThread from '../components/MessageThread';
import DocumentBadge from '../components/DocumentBadge';

export default function Community({ role }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to fetch community questions', err);
    }
    setLoading(false);
  };

  // fetchQuestions is intentionally defined at component scope so send/close handlers can reuse it for refetching.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchQuestions(); }, []);

  if (!role) return <Navigate to="/" />;

  const handleSendMessage = async (questionId, content) => {
    try {
      await api.post('/messages', { questionId, content });
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleClose = async (questionId) => {
    try {
      await api.patch(`/questions/${questionId}/close`);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close conversation');
    }
  };

  const activeQuestions = questions.filter(q => q.status !== 'closed');

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading community questions...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Users color="#059669" size={28} />
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Community Q&A</h1>
      </div>
      <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Every conversation across all documents, in one place.</p>

      {activeQuestions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p className="text-muted">No open questions right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeQuestions.map(q => (
            <div key={q.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ marginBottom: '0.5rem' }}><DocumentBadge question={q} /></div>
                  <p style={{ fontWeight: 500, margin: '0.5rem 0 0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{q.content}</p>
                  <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Asked by {q.user?.name || 'a citizen'}</p>
                </div>
                <StatusBadge question={q} />
              </div>

              <MessageThread question={q} currentUserId={userId} currentRole={role} onSend={handleSendMessage} onClose={handleClose} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
