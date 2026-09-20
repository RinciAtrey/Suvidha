import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FileText, LogOut, Info, LayoutDashboard, Menu, X, Users, Inbox, Ticket, Landmark } from 'lucide-react';
import api from '../lib/api';

export default function Navbar({ role, setRole }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(localStorage.getItem('isAvailable') === 'true');
  const userName = localStorage.getItem('name') || 'Citizen';

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAvailable');
    setRole(null);
    setOpen(false);
    navigate('/');
  };

  const toggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    localStorage.setItem('isAvailable', String(next));
    try {
      await api.patch('/users/availability', { isAvailable: next });
    } catch {
      // Revert on failure so the toggle stays truthful
      setIsAvailable(!next);
      localStorage.setItem('isAvailable', String(!next));
    }
  };

  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={role ? '/dashboard' : '/'} className="navbar-logo" onClick={closeMenu}>
          <FileText color="#059669" />
          <span className="gradient-text">Suvidha Portal</span>
        </Link>

        <button className="navbar-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          {role ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              <NavLink to="/info" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <Info size={16} /> Document Info
              </NavLink>
              <NavLink to="/schemes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <Landmark size={16} /> Schemes
              </NavLink>
              <NavLink to="/community" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <Users size={16} /> Community
              </NavLink>
              {(role === 'admin' || role === 'superadmin') && (
                <NavLink to="/my-tickets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                  <Inbox size={16} /> My Tickets
                </NavLink>
              )}
              {role === 'superadmin' && (
                <NavLink to="/pending-queue" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                  <Ticket size={16} /> Pending Queue
                </NavLink>
              )}

              <div className="navbar-user">
                {(role === 'admin' || role === 'superadmin') && (
                  <button
                    onClick={toggleAvailability}
                    className="badge"
                    style={{
                      cursor: 'pointer', border: 'none',
                      background: isAvailable ? 'var(--soft-bg)' : '#fee2e2',
                      color: isAvailable ? 'var(--primary-dark)' : '#b91c1c',
                    }}
                  >
                    ● {isAvailable ? 'Available' : 'Offline'}
                  </button>
                )}
                <span style={{ fontWeight: 500 }}>Hello, {userName}</span>
                <span className={`badge ${role !== 'user' ? 'badge-admin' : ''}`}>
                  {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Government Official' : 'Citizen'}
                </span>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                Log In
              </NavLink>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }} onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
