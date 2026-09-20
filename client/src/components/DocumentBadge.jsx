import { Link } from 'react-router-dom';
import { FileText, Headset } from 'lucide-react';

export default function DocumentBadge({ question }) {
  if (!question.documentId) {
    return (
      <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <Headset size={12} /> General Support (from AI Chat)
      </span>
    );
  }
  return (
    <Link to={`/document/${question.documentId}`} className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
      <FileText size={12} /> {question.document?.title}
    </Link>
  );
}
