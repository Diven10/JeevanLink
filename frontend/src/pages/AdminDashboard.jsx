import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { StatCard, StatusBadge, EmptyState, LoadingSpinner } from '../components/UI';
import { Users, Building2, FlaskConical, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

const roleColors = { DONOR: '#e11d48', HOSPITAL: '#3b82f6', BLOOD_BANK: '#10b981', ADMIN: '#8b5cf6', RECIPIENT: '#f59e0b' };
const roleIcons = { DONOR: '🩸', HOSPITAL: '🏥', BLOOD_BANK: '🧪', ADMIN: '🛡️', RECIPIENT: '👤' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/admin/users'),
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>System Overview</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>Administrator: <strong>{user?.name}</strong> — Full system access</p>
      </div>

      {/* Stats */}
      {loading ? <LoadingSpinner /> : stats && (
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <StatCard icon={Users} label="Total Donors" value={stats.totalDonors} accentColor="#e11d48" />
          <StatCard icon={Building2} label="Hospitals" value={stats.totalHospitals} accentColor="#3b82f6" />
          <StatCard icon={FlaskConical} label="Blood Banks" value={stats.totalBloodBanks} accentColor="#10b981" />
          <StatCard icon={AlertTriangle} label="Emergency Requests" value={stats.emergencyRequests} change={`of ${stats.totalRequests} total`} accentColor="#f59e0b" />
        </div>
      )}

      {/* Users Table */}
      <div className="card-jl">
        <div className="card-jl-header">
          <h3>User Directory</h3>
          <span className="badge-jl badge-info">{users.length} total</span>
        </div>
        {loading ? <LoadingSpinner /> : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="No users registered yet." />
        ) : (
          <div className="table-jl-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: roleColors[u.role] || '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: `${roleColors[u.role]}15`, color: roleColors[u.role] }}>
                        {roleIcons[u.role]} {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Health */}
      <div className="card-jl" style={{ marginTop: '1.5rem' }}>
        <div className="card-jl-header"><h3>System Status</h3></div>
        <div className="card-jl-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Database', status: 'Operational', icon: Activity },
              { label: 'Matching Engine', status: 'Active', icon: ShieldCheck },
              { label: 'Notifications', status: 'Active', icon: AlertTriangle },
              { label: 'Authentication', status: 'Operational', icon: ShieldCheck },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.label}</span>
                  </div>
                  <span className="badge-jl badge-success">● {s.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
