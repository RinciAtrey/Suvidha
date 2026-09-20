import { useState } from 'react';
import { Send } from 'lucide-react';

export default function MessageThread({ question, currentUserId, currentRole, onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const isAsker = question.userId === currentUserId;
  const isAssignedAdmin = currentRole === 'admin' && question.assignedToId === currentUserId;
  const isSuperadmin = currentRole === 'superadmin';
  const canReply = isAsker || isAssignedAdmin || isSuperadmin;

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await onSend(question.id, text);
    setText('');
    setSending(false);
  };

  return (
    <div>
      {question.messages?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: canReply ? '0.75rem' : 0 }}>
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
                <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>{m.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {canReply && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="input-field"
            placeholder={isAsker && !isAssignedAdmin && !isSuperadmin ? 'Add a follow-up...' : 'Type your reply...'}
            style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', borderColor: '#047857', color: '#047857' }} onClick={handleSend} disabled={sending}>
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
