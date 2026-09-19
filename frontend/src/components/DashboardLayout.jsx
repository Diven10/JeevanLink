import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, User, Droplets, Calendar, Bell, Settings, LogOut,
  Menu, X, Heart, Building2, FlaskConical, ShieldCheck, Users,
  FileText, AlertTriangle, Activity
} from 'lucide-react';

const roleNavConfig = {
  DONOR: [
    { label: 'Dashboard', href: '/donor/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', href: '/donor/profile', icon: User },
    { label: 'Eligibility', href: '/donor/eligibility', icon: Heart },
    { label: 'Donations', href: '/donor/donations', icon: Droplets },
    { label: 'Appointments', href: '/donor/appointments', icon: Calendar },
    { label: 'Notifications', href: '/donor/notifications', icon: Bell },
  ],
  RECIPIENT: [
    { label: 'Dashboard', href: '/recipient/dashboard', icon: LayoutDashboard },
    { label: 'New Blood Request', href: '/recipient/requests/new', icon: Droplets },
    { label: 'Organ Donation', href: '/organ-donation', icon: Heart },
    { label: 'Notifications', href: '/recipient/notifications', icon: Bell },
  ],
  HOSPITAL: [
    { label: 'Dashboard', href: '/hospital/dashboard', icon: LayoutDashboard },
    { label: 'Blood Requests', href: '/hospital/requests', icon: Droplets },
    { label: 'Emergency Request', href: '/hospital/emergency-request', icon: AlertTriangle },
    { label: 'Organ Requests', href: '/hospital/organ-requests', icon: Activity },
    { label: 'Notifications', href: '/hospital/notifications', icon: Bell },
  ],
  BLOOD_BANK: [
    { label: 'Dashboard', href: '/blood-bank/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', href: '/blood-bank/inventory', icon: FlaskConical },
    { label: 'Requests', href: '/blood-bank/requests', icon: FileText },
    { label: 'Notifications', href: '/blood-bank/notifications', icon: Bell },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Verification', href: '/admin/verification', icon: ShieldCheck },
    { label: 'Reports', href: '/admin/reports', icon: FileText },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  ],
};

const roleIcon = { DONOR: Heart, HOSPITAL: Building2, BLOOD_BANK: FlaskConical, ADMIN: ShieldCheck };
const roleLabel = { DONOR: 'Donor', RECIPIENT: 'Recipient', HOSPITAL: 'Hospital', BLOOD_BANK: 'Blood Bank', ADMIN: 'Administrator' };

export default function DashboardLayout({ children, title, subtitle, actions }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = roleNavConfig[user?.role] || [];
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar-jl ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">🩸 JeevanLink</div>
          <div className="sidebar-logo-sub">Smart Blood & Organ System</div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <div className="sidebar-section-label" style={{ marginTop: 16 }}>Other</div>
          <Link to="/" className="sidebar-link">
            <LayoutDashboard size={18} />
            Home / Landing
          </Link>
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout}>
            <div className="sidebar-user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div className="sidebar-user-role">{roleLabel[user?.role]}</div>
            </div>
            <LogOut size={15} style={{ color: '#475569', flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        {/* Top Bar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="btn-ghost-jl"
              style={{ display: 'none', padding: 8 }}
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-actions">
            {actions}
            <div className="notification-btn" onClick={() => navigate(`/${user?.role === 'BLOOD_BANK' ? 'blood-bank' : user?.role?.toLowerCase()}/notifications`)}>
              <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
              <span className="notif-dot" />
            </div>
            <div
              className="sidebar-user-avatar"
              style={{ cursor: 'pointer', width: 36, height: 36, fontSize: '0.8rem' }}
              onClick={handleLogout}
              title="Click to logout"
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {subtitle && (
            <div className="page-header">
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{subtitle}</p>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
