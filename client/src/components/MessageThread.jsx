import { useState } from 'react';
import { Send, XCircle, CheckCircle2 } from 'lucide-react';

export default function MessageThread({ question, currentUserId, currentRole, onSend, onClose }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const isAsker = question.userId === currentUserId;
  const isAssignedAdmin = currentRole === 'admin' && question.assignedToId === currentUserId;
  const isSuperadmin = currentRole === 'superadmin';
  const isClosed = question.status === 'closed';
  const canReply = (isAsker || isAssignedAdmin || isSuperadmin) && !isClosed;
  const canClose = (isAssignedAdmin || isSuperadmin) && !isClosed && !!onClose;

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await onSend(question.id, text);
    setText('');
    setSending(false);
  };

  const handleClose = async () => {
    if (closing || !window.confirm('End this chat? No further replies will be allowed.')) return;
    setClosing(true);
    await onClose(question.id);
    setClosing(false);
  };

  return (
    <div>
      {question.messages?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: (canReply || canClose || isClosed) ? '0.75rem' : 0 }}>
          {question.messages.map(m => {
            const fromStaff = m.authorRole === 'admin' || m.authorRole === 'superadmin';
            return (
              <div
                key={m.id}
                style={{
                  marginLeft: fromStaff ? '2rem' : 0,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: fromStaff ? 'rgba(4, 120, 87, 0.08)' : 'rgba(148, 163, 184, 0.12)',
                  borderLeft: fromStaff ? '3px solid #047857' : '3px solid #94a3b8',
                }}
              >
                <span style={{
                  color: fromStaff ? '#047857' : '#475569', fontWeight: 600, display: 'block',
                  fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem',
                }}>
                  {fromStaff ? `Official Response - ${m.author?.name || 'Staff'}` : m.author?.name || 'Citizen'}
                </span>
                <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {isClosed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.9rem', background: 'var(--soft-bg)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-color)' }}>
          <CheckCircle2 size={16} color="#047857" style={{ flexShrink: 0 }} />
          Chat closed by {question.closedBy?.name || 'staff'}{question.closedAt ? ` on ${new Date(question.closedAt).toLocaleDateString()}` : ''}.
        </div>
      )}

      {(canReply || canClose) && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {canReply && (
            <input
              className="input-field"
              placeholder={isAsker && !isAssignedAdmin && !isSuperadmin ? 'Add a follow-up...' : 'Type your reply...'}
              style={{ flex: '1 1 160px', padding: '0.6rem 1rem', fontSize: '0.875rem' }}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
          )}
          {canReply && (
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', borderColor: '#047857', color: '#047857', flexShrink: 0 }} onClick={handleSend} disabled={sending}>
              <Send size={16} />
            </button>
          )}
          {canClose && (
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', borderColor: '#ef4444', color: '#ef4444', flexShrink: 0 }} onClick={handleClose} disabled={closing}>
              <XCircle size={16} /> End Chat
            </button>
          )}
        </div>
      )}
    </div>
  );
}
