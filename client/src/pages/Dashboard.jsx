import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, Heart, Briefcase, Baby, MapPin, GraduationCap, Clock, Inbox, Ticket, AlertTriangle } from 'lucide-react';
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

const LIFE_EVENTS = [
  { label: 'Got Married', icon: Heart, color: '#ec4899', to: '/info?search=Marriage' },
  { label: 'Moved Cities', icon: MapPin, color: '#3b82f6', to: '/info?search=Domicile' },
  { label: 'New Baby', icon: Baby, color: '#10b981', to: '/info?search=Birth' },
  { label: 'First Job', icon: Briefcase, color: '#f59e0b', to: '/info?search=EPF' },
  { label: 'Turning 18', icon: GraduationCap, color: '#8b5cf6', to: '/info?search=Voter' },
  { label: 'Turning 60', icon: Clock, color: '#64748b', to: '/schemes' },
];

function CitizenDashboard() {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>

      {/* Check My Schemes CTA */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%)', border: '1px solid rgba(5, 150, 105, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Check My Schemes</h2>
          <p className="text-muted" style={{ margin: 0 }}>Find government schemes you are eligible for in 2 minutes.</p>
        </div>
        <Link to="/schemes" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem', whiteSpace: 'nowrap' }}>
          Check Eligibility <ChevronRight size={20} />
        </Link>
      </div>

      {/* Life Events Section */}
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Life Events</h2>
        <p className="text-muted" style={{ marginTop: '-1rem', marginBottom: '1.5rem' }}>Tell us what's happening in your life, and we'll point you to the right documents or schemes.</p>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
          {LIFE_EVENTS.map((event) => (
            <Link
              key={event.label}
              to={event.to}
              className="glass-panel life-event-card"
              style={{ minWidth: '160px', padding: '1.5rem', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
            >
              <event.icon size={32} color={event.color} style={{ margin: '0 auto 1rem auto' }} />
              <h4 style={{ margin: 0 }}>{event.label}</h4>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function Dashboard({ role }) {
  if (!role) return <Navigate to="/" />;

  return (role === 'admin' || role === 'superadmin') ? <StaffDashboard role={role} /> : <CitizenDashboard />;
}
