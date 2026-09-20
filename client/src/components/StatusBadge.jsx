export default function StatusBadge({ question }) {
  if (question.status === 'answered') {
    return <span className="status-badge status-added">Answered</span>;
  }
  if (question.status === 'assigned') {
    return (
      <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
        Pending — Assigned to {question.assignedTo?.name || 'an admin'}
      </span>
    );
  }
  return (
    <span className="status-badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
      Not Available to Answer Right Now
    </span>
  );
}
