import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { StatCard, StatusBadge, BloodGroupBadge, EmptyState, LoadingSpinner } from '../components/UI';
import { Heart, Droplets, CheckCircle, Bell, AlertTriangle } from 'lucide-react';

function formatBG(bg) {
  return bg?.replace('_POS', '+').replace('_NEG', '-') || bg;
}

function EmergencyNotifCard({ match, onRespond }) {
  const hosp = match.bloodRequest?.hospital?.user?.name || 'Unknown Hospital';
  const bg = formatBG(match.bloodRequest?.bloodGroup);
  const units = match.bloodRequest?.units;

  return (
    <div className="emergency-notif-card">
      <div className="emergency-notif-header">
        <span className="emergency-notif-badge">🚨 Emergency</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {new Date(match.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="emergency-notif-info">
        <div className="emergency-notif-info-row">
          <Droplets size={15} />
          <strong style={{ color: 'var(--brand-primary)' }}>{bg}</strong> blood required
        </div>
        <div className="emergency-notif-info-row">
          <span style={{ width: 15 }}>💧</span>
          <strong>{units} unit{units > 1 ? 's' : ''}</strong> needed
        </div>
        <div className="emergency-notif-info-row">
          <span style={{ width: 15 }}>🏥</span>
          {hosp}
        </div>
      </div>
      {match.status === 'POTENTIAL' && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary-jl"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => onRespond(match.id, 'ACCEPTED')}
          >
            <CheckCircle size={15} /> Accept Request
          </button>
          <button
            className="btn-outline-jl"
            style={{ flex: 1, justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            onClick={() => onRespond(match.id, 'DECLINED')}
          >
            Decline
          </button>
        </div>
      )}
      {match.status !== 'POTENTIAL' && (
        <div style={{ textAlign: 'center', paddingTop: 8, fontSize: '0.875rem', fontWeight: 600, color: match.status === 'ACCEPTED' ? 'var(--success)' : 'var(--text-muted)' }}>
          {match.status === 'ACCEPTED' ? '✓ Donation recorded' : `Status: ${match.status}`}
        </div>
      )}
    </div>
  );
}

export default function DonorDashboard() {
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [mRes, nRes, dRes] = await Promise.all([
        axios.get('http://localhost:5000/api/matches/donor'),
        axios.get('http://localhost:5000/api/notifications'),
        axios.get('http://localhost:5000/api/donors/me'),
      ]);
      setMatches(mRes.data);
      setNotifications(nRes.data);
      setProfile(dRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const handleRespond = async (matchId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/matches/${matchId}/respond`, { status });
      toast.success(status === 'ACCEPTED' ? '✓ Request accepted! The hospital has been notified.' : 'Request declined.');
      fetchAll();
    } catch { toast.error('Failed to respond'); }
  };

  const markRead = async (id) => {
    try { await axios.put(`http://localhost:5000/api/notifications/${id}/read`); } catch {}
  };

  const pending = matches.filter(m => m.status === 'POTENTIAL').length;
  const accepted = matches.filter(m => m.status === 'ACCEPTED').length;
  const unread = notifications.filter(n => !n.isRead).length;
  return (
    <DashboardLayout title="Donor Dashboard">
      {/* Welcome */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Good to see you, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
          You're making a difference. Here's your donor overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          icon={Heart}
          label="Eligibility"
          value={profile?.eligibility === 'ELIGIBLE' ? '✓ Eligible' : '✗ Ineligible'}
          accentColor={profile?.eligibility === 'ELIGIBLE' ? '#10b981' : '#ef4444'}
        />
        <StatCard icon={Droplets} label="Total Donations" value={profile?.donationCount ?? 0} accentColor="#e11d48" />
        <StatCard icon={AlertTriangle} label="Pending Matches" value={pending} accentColor="#f59e0b" />
        <StatCard icon={Bell} label="Unread Alerts" value={unread} accentColor="#3b82f6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Profile & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Profile Card */}
          <div className="card-jl">
            <div className="card-jl-header"><h3>My Profile</h3></div>
            <div className="card-jl-body">
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 12px' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Blood Group', value: <BloodGroupBadge group={profile?.bloodGroup} /> },
                  { label: 'Eligibility', value: <span className={`badge-jl badge-${profile?.eligibility === 'ELIGIBLE' ? 'success' : 'danger'}`}>{profile?.eligibility?.replace(/_/g, ' ')}</span> },
                  { label: 'City', value: profile?.city || 'Not set' },
                  { label: 'Donations', value: profile?.donationCount ?? 0 },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{r.label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="card-jl">
            <div className="card-jl-header">
              <h3>Notifications</h3>
              {unread > 0 && <span className="badge-jl badge-danger">{unread} new</span>}
            </div>
            <div>
              {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
              ) : notifications.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  className={`notification-card ${!n.isRead ? 'unread' : ''}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className="notification-card-body">
                    <div className="notification-card-title">{n.title}</div>
                    <div className="notification-card-message">{n.message}</div>
                    <div className="notification-card-time">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Matches */}
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>Emergency Requests</h3>
            {pending > 0 && <span className="badge-jl badge-emergency">{pending} pending</span>}
          </div>
          <div className="card-jl-body">
            {loading ? <LoadingSpinner /> : matches.length === 0 ? (
              <EmptyState icon={Heart} title="No emergency requests" description="You'll be notified here when a hospital nearby needs your blood type." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {matches.map(m => (
                  <EmergencyNotifCard key={m.id} match={m} onRespond={handleRespond} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .donor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
