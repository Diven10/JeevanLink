// Centralized reusable UI components for JeevanLink

// ── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ icon: Icon, label, value, change, accentColor = '#e11d48' }) => (
  <div className="stat-card" style={{ '--accent-color': accentColor }}>
    {Icon && (
      <div className="stat-icon" style={{ background: `${accentColor}15`, color: accentColor }}>
        <Icon size={20} />
      </div>
    )}
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value ?? '—'}</div>
    {change && <div className="stat-change">{change}</div>}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
const badgeVariants = {
  PENDING:    'gray',
  MATCHING:   'info',
  MATCHED:    'info',
  ACCEPTED:   'success',
  FULFILLED:  'success',
  REJECTED:   'danger',
  CANCELLED:  'danger',
  ELIGIBLE:   'success',
  TEMPORARILY_INELIGIBLE: 'warning',
  PERMANENTLY_INELIGIBLE: 'danger',
  NORMAL:     'gray',
  URGENT:     'warning',
  EMERGENCY:  'danger',
  POTENTIAL:  'warning',
  NOTIFIED:   'info',
  DECLINED:   'danger',
};

export const StatusBadge = ({ status }) => {
  const variant = badgeVariants[status] || 'gray';
  return (
    <span className={`badge-jl badge-${variant}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

// ── Blood Group Badge ─────────────────────────────────────────────────────────
export const BloodGroupBadge = ({ group }) => (
  <span style={{
    display: 'inline-block',
    background: '#fff1f2',
    color: '#e11d48',
    fontWeight: 700,
    fontSize: '0.85rem',
    padding: '3px 10px',
    borderRadius: 6,
    border: '1px solid rgba(225,29,72,0.2)',
  }}>
    {group?.replace('_POS', '+').replace('_NEG', '-')}
  </span>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && <Icon size={48} />}
    <h4>{title}</h4>
    {description && <p>{description}</p>}
    {action}
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────────────────────
export const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-spinner" style={{ flexDirection: 'column', gap: 12 }}>
    <div className="spinner" />
    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{text}</span>
  </div>
);

// ── Page Header ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-header flex-between flex-wrap" style={{ gap: 12 }}>
    <div>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4, marginBottom: 0 }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, action }) => (
  <div className="card-jl-header">
    <h3>{title}</h3>
    {action}
  </div>
);
