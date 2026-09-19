import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const bloodGroups = [
  { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
  { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
  { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
  { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'DONOR',
    bloodGroup: 'O_POS', address: '', city: '',
    latitude: '', longitude: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const d = { ...formData };
      if (d.latitude) d.latitude = parseFloat(d.latitude);
      if (d.longitude) d.longitude = parseFloat(d.longitude);
      await register(d);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      setLoading(false);
    }
  };

  const needsBloodGroup = formData.role === 'DONOR' || formData.role === 'RECIPIENT';

  return (
    <div className="auth-page">
      {/* Brand Panel */}
      <div className="auth-brand-panel col-lg-4 d-none d-lg-flex">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>🩸</div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, letterSpacing: -1, lineHeight: 1.15, marginBottom: '1rem' }}>
            Join the<br /><span style={{ color: '#f43f5e' }}>JeevanLink</span><br />Network
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 280 }}>
            Register as a donor, hospital, or blood bank and become part of a life-saving network.
          </p>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Demo password</div>
            <code style={{ color: '#f43f5e', fontSize: '0.9rem', fontWeight: 700 }}>password123</code>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel col-12 col-lg-8">
        <div className="auth-form-card" style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/login" style={{ color: 'var(--brand-primary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>← Back to Login</Link>
          </div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join JeevanLink and help save lives.</p>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            <div className="form-section">
              <div className="form-section-title">Account Information</div>
              <div className="grid-2">
                <div className="form-group-jl">
                  <label className="form-label-jl">Full Name / Organization <span className="req">*</span></label>
                  <input className="input-jl" type="text" placeholder="John Doe" value={formData.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="form-group-jl">
                  <label className="form-label-jl">Phone Number</label>
                  <input className="input-jl" type="tel" placeholder="+91 99999 99999" value={formData.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-group-jl">
                <label className="form-label-jl">Email Address <span className="req">*</span></label>
                <input className="input-jl" type="email" placeholder="you@example.com" value={formData.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group-jl">
                <label className="form-label-jl">Password <span className="req">*</span></label>
                <input className="input-jl" type="password" placeholder="Minimum 8 characters" value={formData.password} onChange={e => set('password', e.target.value)} required minLength={6} />
              </div>
            </div>

            {/* Role */}
            <div className="form-section">
              <div className="form-section-title">Role &amp; Profile</div>
              <div className="form-group-jl">
                <label className="form-label-jl">I am registering as <span className="req">*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { value: 'DONOR', label: '🩸 Donor', desc: 'Individual donor' },
                    { value: 'HOSPITAL', label: '🏥 Hospital', desc: 'Medical institution' },
                    { value: 'BLOOD_BANK', label: '🧪 Blood Bank', desc: 'Blood storage facility' },
                    { value: 'RECIPIENT', label: '🧑 Recipient', desc: 'Patient / requester' },
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set('role', r.value)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 8,
                        border: `2px solid ${formData.role === r.value ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                        background: formData.role === r.value ? 'var(--brand-primary-light)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: formData.role === r.value ? 'var(--brand-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      <div>{r.label}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {needsBloodGroup && (
                <div className="form-group-jl">
                  <label className="form-label-jl">Blood Group <span className="req">*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {bloodGroups.map(bg => (
                      <button
                        key={bg.value}
                        type="button"
                        onClick={() => set('bloodGroup', bg.value)}
                        style={{
                          padding: '10px 4px',
                          borderRadius: 8,
                          border: `2px solid ${formData.bloodGroup === bg.value ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                          background: formData.bloodGroup === bg.value ? 'var(--brand-primary)' : 'white',
                          color: formData.bloodGroup === bg.value ? 'white' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="form-section">
              <div className="form-section-title">Location</div>
              <div className="form-group-jl">
                <label className="form-label-jl">City</label>
                <input className="input-jl" type="text" placeholder="e.g., Mumbai" value={formData.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="form-group-jl">
                  <label className="form-label-jl">Latitude (optional)</label>
                  <input className="input-jl" type="number" step="any" placeholder="e.g., 19.0760" value={formData.latitude} onChange={e => set('latitude', e.target.value)} />
                </div>
                <div className="form-group-jl">
                  <label className="form-label-jl">Longitude (optional)</label>
                  <input className="input-jl" type="number" step="any" placeholder="e.g., 72.8777" value={formData.longitude} onChange={e => set('longitude', e.target.value)} />
                </div>
              </div>
              <p className="form-hint">Location helps us match you with nearby requests. You can skip this for now.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-jl"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
