import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';
import { Landmark, Search, ClipboardCheck, ExternalLink, Sparkles } from 'lucide-react';

const CATEGORY_COLORS = {
  'Agriculture': '#059669',
  'Health': '#0ea5e9',
  'Housing': '#f59e0b',
  'Education': '#8b5cf6',
  'Women & Child': '#ec4899',
  'Employment': '#0d9488',
  'Senior Citizens': '#64748b',
  'Financial Inclusion': '#047857',
};

function SchemeCard({ scheme }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <span
        className="badge"
        style={{
          alignSelf: 'flex-start', marginBottom: '0.75rem',
          background: `${CATEGORY_COLORS[scheme.category] || '#059669'}1a`,
          color: CATEGORY_COLORS[scheme.category] || '#059669',
          borderColor: `${CATEGORY_COLORS[scheme.category] || '#059669'}33`,
        }}
      >
        {scheme.category}
      </span>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{scheme.name}</h3>
      <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem', flex: 1 }}>
        {scheme.description}
      </p>
      <div style={{ background: 'var(--soft-bg)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
        <strong>Benefits:</strong> {scheme.benefits}
      </div>
      {scheme.officialLink && (
        <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ width: '100%' }}>
          Official Portal <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

function EligibilityForm({ onResults }) {
  const [form, setForm] = useState({ age: '', gender: '', income: '', occupation: '', socialCategory: '', isStudent: '' });
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: form.age === '' ? undefined : Number(form.age),
        income: form.income === '' ? undefined : Number(form.income),
        isStudent: form.isStudent === '' ? undefined : form.isStudent === 'yes',
      };
      const res = await api.post('/schemes/eligible', payload);
      onResults(res.data);
      setChecked(true);
    } catch (err) {
      alert('Failed to check eligibility. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
      <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ClipboardCheck size={22} color="#059669" /> Tell us about yourself
      </h3>
      <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Answer every field for an accurate shortlist — results are indicative only, always confirm final eligibility on the official scheme portal.
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}>Age</label>
          <input type="number" min="0" max="120" required className="input-field" value={form.age} onChange={handleChange('age')} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}>Gender</label>
          <select className="input-field" required value={form.gender} onChange={handleChange('gender')}>
            <option value="" disabled>Select one</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other / Prefer not to say</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}>Annual Family Income (₹)</label>
          <input type="number" min="0" required className="input-field" value={form.income} onChange={handleChange('income')} placeholder="e.g. 150000" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}>Occupation</label>
          <select className="input-field" required value={form.occupation} onChange={handleChange('occupation')}>
            <option value="" disabled>Select one</option>
            <option value="farmer">Farmer</option>
            <option value="business">Business Owner</option>
            <option value="self-employed">Self-Employed</option>
            <option value="salaried">Salaried Employee</option>
            <option value="unemployed">Unemployed</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}>Social Category</label>
          <select className="input-field" required value={form.socialCategory} onChange={handleChange('socialCategory')}>
            <option value="" disabled>Select one</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}>Are you a student?</label>
          <select className="input-field" required value={form.isStudent} onChange={handleChange('isStudent')}>
            <option value="" disabled>Select one</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', padding: '1rem' }} disabled={loading}>
          <Sparkles size={18} /> {loading ? 'Checking...' : checked ? 'Re-check Eligibility' : 'Check My Eligibility'}
        </button>
      </form>
    </div>
  );
}

export default function Schemes({ role }) {
  const [tab, setTab] = useState('all');
  const [allSchemes, setAllSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eligibleResults, setEligibleResults] = useState(null);

  if (!role) return <Navigate to="/" />;

  useEffect(() => {
    api.get('/schemes').then(res => setAllSchemes(res.data)).catch(err => console.error('Failed to load schemes', err)).finally(() => setLoading(false));
  }, []);

  const filteredSchemes = allSchemes.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Landmark color="#059669" size={28} />
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Government Schemes</h1>
      </div>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Browse every scheme, or check which ones you're likely eligible for.</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
        <button
          className={tab === 'all' ? 'btn btn-primary' : 'btn btn-outline'}
          style={{ padding: '0.6rem 1.25rem' }}
          onClick={() => setTab('all')}
        >
          All Schemes
        </button>
        <button
          className={tab === 'eligible' ? 'btn btn-primary' : 'btn btn-outline'}
          style={{ padding: '0.6rem 1.25rem' }}
          onClick={() => setTab('eligible')}
        >
          Schemes You're Eligible For
        </button>
      </div>

      {tab === 'all' ? (
        <>
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {loading ? (
            <p className="text-muted">Loading schemes...</p>
          ) : (
            <div className="grid grid-cols-3">
              {filteredSchemes.map(s => <SchemeCard key={s.id} scheme={s} />)}
            </div>
          )}
        </>
      ) : (
        <>
          <EligibilityForm onResults={setEligibleResults} />

          {eligibleResults !== null && (
            <>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                {eligibleResults.length} Scheme{eligibleResults.length !== 1 ? 's' : ''} You May Be Eligible For
              </h2>
              {eligibleResults.length === 0 ? (
                <p className="text-muted">No schemes matched the details you provided. Try adjusting your answers.</p>
              ) : (
                <div className="grid grid-cols-3">
                  {eligibleResults.map(s => <SchemeCard key={s.id} scheme={s} />)}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
