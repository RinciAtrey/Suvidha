import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, UserRound, Bot, Headset } from 'lucide-react';
import api from '../lib/api';
import MessageThread from './MessageThread';
import StatusBadge from './StatusBadge';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('ai'); // 'ai' | 'escalated'
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the Suvidha Portal assistant. Ask me about any government document or scheme, and I'll do my best to help." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const userId = localStorage.getItem('userId');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, question]);

  useEffect(() => {
    if (mode !== 'escalated' || !question || !open) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/questions/${question.id}`);
        setQuestion(res.data);
      } catch {
        // ignore transient poll failures
      }
    }, 5000);
    return () => clearInterval(interval);
    // Depending on question?.id (not the whole question object) is intentional - the object changes on every
    // poll tick, and depending on it directly would tear down and recreate the interval every 5 seconds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, question?.id, open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot', { message: userMessage.content, history: messages });
      setMessages([...nextMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages([...nextMessages, { role: 'assistant', content: err.response?.data?.error || "Sorry, I'm having trouble right now. Try talking to a human instead." }]);
    }
    setLoading(false);
  };

  const handleEscalate = async () => {
    setLoading(true);
    try {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || 'I need help.';
      const res = await api.post('/questions/chat-escalate', { content: lastUserMessage, transcript: messages });
      setQuestion(res.data);
      setMode('escalated');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to connect to a human. Please try again.');
    }
    setLoading(false);
  };

  const handleThreadMessage = async (questionId, content) => {
    await api.post('/messages', { questionId, content });
    const res = await api.get(`/questions/${questionId}`);
    setQuestion(res.data);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chat assistant"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', width: '56px', height: '56px',
          borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4)', zIndex: 100,
        }}
      >
        <MessageCircle size={26} />
      </button>
    );
  }

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', width: '360px', maxWidth: 'calc(100vw - 2rem)',
        height: '520px', maxHeight: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column',
        zIndex: 100, overflow: 'hidden', padding: 0,
      }}
    >
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--soft-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          {mode === 'ai' ? <Bot size={18} color="#059669" /> : <Headset size={18} color="#047857" />}
          {mode === 'ai' ? 'AI Assistant' : 'Human Support'}
        </div>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}>
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {mode === 'ai' ? (
          <>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%', padding: '0.6rem 0.9rem', borderRadius: '12px', fontSize: '0.875rem', lineHeight: '1.5',
                  background: m.role === 'user' ? 'var(--primary)' : 'var(--soft-bg)',
                  color: m.role === 'user' ? 'white' : 'var(--text-color)',
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && <div style={{ alignSelf: 'flex-start', fontSize: '0.8rem', color: '#5b7a6d' }}>Thinking...</div>}
          </>
        ) : (
          <>
            <div style={{ fontSize: '0.85rem' }}>
              <StatusBadge question={question} />
              <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                {question.assignedTo
                  ? `Connected to ${question.assignedTo.name}. They'll reply here.`
                  : 'No admin is available right now - your message is in the queue and will be answered as soon as possible.'}
              </p>
            </div>
            <MessageThread question={question} currentUserId={userId} currentRole="user" onSend={handleThreadMessage} />
          </>
        )}
      </div>

      {mode === 'ai' && (
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              className="input-field"
              style={{ fontSize: '0.875rem', padding: '0.6rem 0.75rem' }}
              placeholder="Ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button className="btn btn-primary" style={{ padding: '0.5rem 0.75rem' }} onClick={handleSend} disabled={loading}>
              <Send size={16} />
            </button>
          </div>
          <button
            className="btn btn-outline"
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
            onClick={handleEscalate}
            disabled={loading}
          >
            <UserRound size={14} /> Still need help? Talk to a Human
          </button>
        </div>
      )}
    </div>
  );
}
