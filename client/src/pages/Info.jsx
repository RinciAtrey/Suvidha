import { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { FileText, ChevronRight, Search } from 'lucide-react';

export default function InfoPage({ role }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/documents');
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
      setLoading(false);
    };
    fetchDocs();
  }, []);

  if (!role) return <Navigate to="/" />;

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading documents...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>

      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', marginBottom: '0.5rem' }}>Document Information Center</h1>
        <p className="text-muted" style={{ margin: 0 }}>Browse and learn about required government documents, required proof, and official portals.</p>
      </div>

      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search for a specific document..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h2 style={{ margin: 0, marginBottom: '2rem', fontSize: '1.5rem' }}>All Civic Documents</h2>

      {filteredDocs.length === 0 ? (
        <p className="text-muted">No documents match "{searchQuery}".</p>
      ) : (
        <div className="grid grid-cols-3">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '12px' }}>
                  <FileText color="#059669" />
                </div>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', marginBottom: '0.5rem' }}>{doc.title}</h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem', flex: 1, fontSize: '0.875rem', lineHeight: '1.5' }}>
                {doc.description}
              </p>
              <Link to={`/document/${doc.id}`} className="btn btn-outline" style={{ width: '100%' }}>
                View Guide <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
