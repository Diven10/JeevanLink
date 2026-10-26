import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Droplets, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const roleDashboardPath = {
    DONOR: '/donor/dashboard',
    HOSPITAL: '/hospital/dashboard',
    BLOOD_BANK: '/blood-bank/dashboard',
    ADMIN: '/admin/dashboard',
    RECIPIENT: '/recipient/dashboard',
  };

  const getDonatePath = () => {
    if (!user) return '/register';
    if (user.role === 'DONOR') return '/donor/appointments';
    return roleDashboardPath[user.role] || '/';
  };

  return (
    <nav className="landing-nav">
      <Link to="/" className="landing-nav-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.4rem' }}>🩸</span>
        <span>JeevanLink</span>
      </Link>

      <div className="landing-nav-links">
        <a href="/#how-it-works">How It Works</a>
        <Link to="/find-blood">Find Blood</Link>
        <Link to={getDonatePath()}>Donate</Link>
        <Link to="/awareness">Awareness &amp; FAQ</Link>
      </div>

      <div className="landing-nav-actions">
        {!user ? (
          <>
            <Link to="/login" className="btn-ghost-jl" style={{ textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn-primary-jl" style={{ textDecoration: 'none' }}>Become a Donor</Link>
          </>
        ) : (
          <>
            <Link to={roleDashboardPath[user.role] || '/'} className="btn-outline-jl" style={{ textDecoration: 'none' }}>
              Dashboard
            </Link>
            <button className="btn-ghost-jl" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
