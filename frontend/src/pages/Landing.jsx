import { Link } from 'react-router-dom';
import { Heart, Droplets, Building2, FlaskConical, ArrowRight, CheckCircle, Bell, Zap } from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const steps = [
  { icon: Droplets, title: 'Request', desc: 'Hospital raises a blood or organ request — normal or emergency.' },
  { icon: Zap, title: 'Match', desc: 'Our engine finds compatible donors and blood banks nearby instantly.' },
  { icon: Bell, title: 'Notify', desc: 'Eligible donors are notified in real-time and can accept or decline.' },
  { icon: Heart, title: 'Save a Life', desc: 'Donation happens, fulfilling the request when every second counts.' },
];

const roles = [
  { icon: Heart, title: 'For Donors', desc: 'Register your blood group, set your location, and get notified when a hospital near you needs your type. Every donation you make is tracked.' },
  { icon: Building2, title: 'For Hospitals', desc: 'Create normal and emergency blood requests. Our intelligent matching engine notifies eligible donors instantly. Track every request in real-time.' },
  { icon: FlaskConical, title: 'For Blood Banks', desc: 'Manage your inventory across all blood types. Receive low-stock alerts and respond to hospital requests directly from your dashboard.' },
];

export default function Landing() {
  return (
    <div style={{ background: '#fff' }}>
      {/* HERO */}
      <section className="hero-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="hero-badge">
                <span style={{ width: 8, height: 8, background: '#f43f5e', borderRadius: '50%', display: 'inline-block' }} />
                Smart Blood &amp; Organ Donation Platform
              </div>
              <h1 className="hero-title">
                Every Second Counts.<br />
                <span className="gradient-text">Every Donation</span><br />
                Matters.
              </h1>
              <p className="hero-subtitle">
                JeevanLink connects blood donors, hospitals, and blood banks with an intelligent matching engine — so no request goes unanswered.
              </p>
              <div className="hero-cta-group">
                <Link to="/hospital/dashboard" className="btn-primary-jl lg" style={{ textDecoration: 'none' }}>
                  <Droplets size={18} />
                  Request Blood
                </Link>
                <Link to="/register" className="btn-outline-jl lg light" style={{ textDecoration: 'none' }}>
                  Become a Donor
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="hero-stats">
                <div>
                  <div className="hero-stat-number">5,000+</div>
                  <div className="hero-stat-label">Registered Donors</div>
                </div>
                <div>
                  <div className="hero-stat-number">200+</div>
                  <div className="hero-stat-label">Hospitals Connected</div>
                </div>
                <div>
                  <div className="hero-stat-number">98%</div>
                  <div className="hero-stat-label">Match Success Rate</div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 hero-visual">
              <div className="hero-blood-ring">
                <div className="hero-blood-inner">
                  <div className="hero-blood-center">
                    <span className="hero-blood-icon">🩸</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOOD AVAILABILITY */}
      <section id="blood-availability" className="section-jl" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Live Availability</div>
            <h2 className="section-title">Blood Group Availability</h2>
            <p className="section-subtitle mx-auto">Check real-time blood availability across registered blood banks in your area.</p>
          </div>
          <div className="grid-4">
            {bloodGroups.map((bg, i) => (
              <div key={bg} className={`blood-group-card ${i % 3 === 0 ? 'low-stock' : ''}`}>
                <div className="blood-type">{bg}</div>
                <div className="blood-units">{i % 3 === 0 ? '5 units' : `${10 + i * 4} units`}</div>
                <div className="blood-label" style={{ marginTop: 4 }}>
                  {i % 3 === 0 ? (
                    <span style={{ color: 'var(--warning)', fontWeight: 700 }}>⚠ LOW STOCK</span>
                  ) : (
                    <span style={{ color: 'var(--success)' }}>● Available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section-jl">
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Process</div>
            <h2 className="section-title">How JeevanLink Works</h2>
          </div>
          <div className="row g-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="col-md-3">
                  <div className="how-step-card">
                    <div className="step-number">{i + 1}</div>
                    <div className="step-icon-wrap">
                      <Icon size={28} />
                    </div>
                    <h5 style={{ fontWeight: 700, marginBottom: 8 }}>{step.title}</h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROLE SECTIONS */}
      <section id="roles" className="section-jl" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Platform</div>
            <h2 className="section-title">Built for Every Stakeholder</h2>
          </div>
          <div className="row g-4">
            {roles.map(role => {
              const Icon = role.icon;
              return (
                <div key={role.title} className="col-md-4">
                  <div className="role-card">
                    <div className="role-card-icon"><Icon size={24} /></div>
                    <h3>{role.title}</h3>
                    <p>{role.desc}</p>
                    <div style={{ marginTop: '1.5rem' }}>
                      {['Instant notifications', 'Real-time tracking', 'Secure & private'].map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                          <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EMERGENCY CTA */}
      <section id="donate" className="section-jl">
        <div className="container">
          <div className="emergency-cta">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
              <h2>Need Blood Urgently?</h2>
              <p>Our emergency matching engine notifies eligible donors near you within seconds. Don't wait — every minute matters.</p>
              <Link to="/login" className="btn-outline-jl light lg" style={{ textDecoration: 'none' }}>
                Create Emergency Request
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-jl">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="footer-brand">🩸 JeevanLink</div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.75rem', maxWidth: 280, lineHeight: 1.7 }}>
                Smart Blood Bank &amp; Organ Donation Management System. Connecting life-savers when it matters most.
              </p>
            </div>
            <div className="col-md-2">
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', marginBottom: 12 }}>Platform</div>
              <div className="footer-links">
                <a href="#how-it-works">How It Works</a>
                <a href="#blood-availability">Find Blood</a>
                <Link to="/register" style={{ display: 'block', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 8 }}>Donate</Link>
              </div>
            </div>
            <div className="col-md-2">
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', marginBottom: 12 }}>Access</div>
              <div className="footer-links">
                <Link to="/login" style={{ display: 'block', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 8 }}>Login</Link>
                <Link to="/register" style={{ display: 'block', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 8 }}>Register</Link>
              </div>
            </div>
          </div>
          <div className="footer-divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>© 2026 JeevanLink. Academic Project.</p>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>Smart Blood Bank &amp; Organ Donation Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
