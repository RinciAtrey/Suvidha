import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../lib/api';
import { Users, MessageSquare, FileText } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import MessageThread from '../components/MessageThread';

export default function Community({ role }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  if (!role) return <Navigate to="/" />;

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to fetch community questions', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleSendMessage = async (questionId, content) => {
    try {
      await api.post('/messages', { questionId, content });
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading community questions...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Users color="#059669" size={28} />
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Community Q&A</h1>
      </div>
      <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Every conversation across all documents, in one place.</p>

      {questions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p className="text-muted">No questions have been asked yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.map(q => (
            <div key={q.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <Link to={`/document/${q.documentId}`} className="badge" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
                    <FileText size={12} /> {q.document?.title}
                  </Link>
                  <p style={{ fontWeight: 500, margin: '0.5rem 0 0', lineHeight: '1.5' }}>{q.content}</p>
                  <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.25rem 0 0' }}>Asked by {q.user?.name || 'a citizen'}</p>
                </div>
                <StatusBadge question={q} />
              </div>

              <MessageThread question={q} currentUserId={userId} currentRole={role} onSend={handleSendMessage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
