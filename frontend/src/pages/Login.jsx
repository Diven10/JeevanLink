import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const rolePaths = {
  DONOR: '/donor/dashboard', HOSPITAL: '/hospital/dashboard',
  BLOOD_BANK: '/blood-bank/dashboard', ADMIN: '/admin/dashboard',
  RECIPIENT: '/recipient/dashboard',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect once user state populates after login
  useEffect(() => {
    if (user) navigate(rolePaths[user.role] || '/', { replace: true });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: '🏥 Hospital', email: 'hospital@demo.com' },
    { label: '🩸 Donor', email: 'donor@demo.com' },
    { label: '🧪 Blood Bank', email: 'bloodbank@demo.com' },
    { label: '🛡️ Admin', email: 'admin@demo.com' },
  ];

  return (
    <div className="auth-page">
      {/* Brand Panel */}
      <div className="auth-brand-panel col-lg-5 d-none d-lg-flex">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🩸</div>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, marginBottom: '1.25rem' }}>
            Save Lives.<br /><span style={{ color: '#f43f5e' }}>Every Day.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, maxWidth: 340, marginBottom: '2rem' }}>
            JeevanLink connects blood donors, hospitals, and blood banks with an intelligent matching engine.
          </p>
          {['Real-time emergency matching', 'Blood & organ donation tracking', 'Secure role-based access'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#cbd5e1', fontSize: '0.875rem', marginBottom: 12 }}>
              <span style={{ width: 20, height: 20, background: 'rgba(225,29,72,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel col-12 col-lg-7">
        <div className="auth-form-card">
          <div style={{ marginBottom: '2rem' }}>
            <Link to="/" style={{ color: 'var(--brand-primary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
          </div>
          <h2>Sign In</h2>
          <p className="auth-subtitle">Welcome back! Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group-jl">
              <label className="form-label-jl">Email Address <span className="req">*</span></label>
              <input type="email" className="input-jl" placeholder="you@hospital.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group-jl">
              <label className="form-label-jl">Password <span className="req">*</span></label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="input-jl" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary-jl" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: 8 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>Quick Demo Login (password: password123)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {demoAccounts.map(acc => (
              <button key={acc.email} type="button"
                className="btn-ghost-jl"
                style={{ border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem', justifyContent: 'center', padding: '9px 12px', fontWeight: 600 }}
                onClick={() => { setEmail(acc.email); setPassword('password123'); }}
              >
                {acc.label}
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
