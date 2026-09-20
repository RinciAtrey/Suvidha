import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, Search, Heart, Briefcase, Baby, MapPin, GraduationCap, Clock, Inbox, Ticket, AlertTriangle } from 'lucide-react';
import api from '../lib/api';

function StaffDashboard({ role }) {
  const [myCount, setMyCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.get('/questions/mine').then(res => setMyCount(res.data.length)).catch(() => {});
    if (role === 'superadmin') {
      api.get('/questions/pending').then(res => setPendingCount(res.data.unassigned.length)).catch(() => {});
    }
  }, [role]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome back</h1>
      <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Here's what needs your attention today.</p>

      <div className="grid grid-cols-2">
        <Link to="/my-tickets" className="glass-panel" style={{ padding: '2rem', textDecoration: 'none', color: 'inherit', borderLeft: '4px solid #059669' }}>
          <Inbox size={28} color="#059669" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: 0, fontSize: '2rem' }}>{myCount}</h2>
          <p className="text-muted" style={{ margin: 0 }}>Tickets assigned to you awaiting a reply</p>
        </Link>

        {role === 'superadmin' && (
          <Link to="/pending-queue" className="glass-panel" style={{ padding: '2rem', textDecoration: 'none', color: 'inherit', borderLeft: '4px solid #ef4444' }}>
            <AlertTriangle size={28} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h2 style={{ margin: 0, fontSize: '2rem' }}>{pendingCount}</h2>
            <p className="text-muted" style={{ margin: 0 }}>Unassigned tickets - no admin was available</p>
          </Link>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/community" className="btn btn-outline" style={{ display: 'inline-flex' }}>
          <Ticket size={16} /> View Community Q&A
        </Link>
      </div>
    </div>
  );
}

function CitizenDashboard() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>

      {/* Search Bar */}
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search for documents, schemes, or services..."
        />
      </div>

      {/* Check My Schemes CTA */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%)', border: '1px solid rgba(5, 150, 105, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Check My Schemes</h2>
          <p className="text-muted" style={{ margin: 0 }}>Find government schemes you are eligible for in 2 minutes.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem', whiteSpace: 'nowrap' }}>
          Check Eligibility <ChevronRight size={20} />
        </button>
      </div>

      {/* Life Events Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Life Events</h2>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>

          <div className="glass-panel" style={{ minWidth: '160px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <Heart size={32} color="#ec4899" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: 0 }}>Got Married</h4>
          </div>

          <div className="glass-panel" style={{ minWidth: '160px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <MapPin size={32} color="#3b82f6" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: 0 }}>Moved Cities</h4>
          </div>

          <div className="glass-panel" style={{ minWidth: '160px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <Baby size={32} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: 0 }}>New Baby</h4>
          </div>

          <div className="glass-panel" style={{ minWidth: '160px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <Briefcase size={32} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: 0 }}>First Job</h4>
          </div>

          <div className="glass-panel" style={{ minWidth: '160px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <GraduationCap size={32} color="#8b5cf6" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: 0 }}>Turning 18</h4>
          </div>

          <div className="glass-panel" style={{ minWidth: '160px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <Clock size={32} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: 0 }}>Turning 60</h4>
          </div>

        </div>
      </div>

      {/* In Progress Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '3rem', borderLeft: '4px solid #059669' }}>
        <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>In Progress: Updating Aadhaar Address</h3>
        <div style={{ width: '100%', background: '#e5f5ef', height: '8px', borderRadius: '4px', marginBottom: '0.75rem' }}>
          <div style={{ width: '60%', background: '#059669', height: '100%', borderRadius: '4px' }}></div>
        </div>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>3 of 5 steps completed. Waiting for verification.</p>
      </div>

    </div>
  );
}

export default function Dashboard({ role }) {
  if (!role) return <Navigate to="/" />;

  return (role === 'admin' || role === 'superadmin') ? <StaffDashboard role={role} /> : <CitizenDashboard />;
}
