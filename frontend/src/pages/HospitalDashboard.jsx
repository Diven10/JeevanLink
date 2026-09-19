import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { StatCard, StatusBadge, BloodGroupBadge, EmptyState, LoadingSpinner } from '../components/UI';
import { Droplets, AlertTriangle, CheckCircle, Clock, PlusCircle, ArrowLeft, Eye, XCircle, RefreshCw } from 'lucide-react';

const API = 'http://localhost:5000';
const bloodGroups = [
  { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
  { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
  { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
  { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' },
];

function RequestForm({ emergency = false, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ bloodGroup: 'O_NEG', units: 1, urgency: emergency ? 'EMERGENCY' : 'NORMAL', requiredDate: '', city: '', state: '' });

  useEffect(() => setForm(p => ({ ...p, urgency: emergency ? 'EMERGENCY' : 'NORMAL' })), [emergency]);

  const submit = async (e) => {
    e.preventDefault();
    if (!Number(form.units) || Number(form.units) < 1) return toast.error('Enter at least 1 unit.');
    setSubmitting(true);
    try {
      const payload = { ...form, units: Number(form.units), requiredDate: form.requiredDate || null };
      const res = await axios.post(`${API}/api/requests`, payload);
      toast.success(res.data.message || 'Blood request created successfully.');
      onCreated?.(res.data.request);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create the request.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="card-jl form-card">
      <div className="card-jl-header">
        <div>
          <h3 style={{ color: emergency ? 'var(--danger)' : undefined }}>{emergency ? '🚨 Emergency Blood Request' : 'New Blood Request'}</h3>
          <p className="muted" style={{ margin: '5px 0 0' }}>{emergency ? 'This immediately starts donor and blood-bank matching.' : 'Create and track a hospital blood requirement.'}</p>
        </div>
        <StatusBadge status={emergency ? 'EMERGENCY' : 'NORMAL'} />
      </div>
      <form className="card-jl-body" onSubmit={submit}>
        <div className="form-section">
          <div className="form-section-title">Blood requirement</div>
          <label className="form-label-jl">Blood group required <span className="req">*</span></label>
          <div className="blood-group-picker">
            {bloodGroups.map(bg => (
              <button key={bg.value} type="button" className={`blood-group-option ${form.bloodGroup === bg.value ? 'selected' : ''}`} onClick={() => setForm(p => ({ ...p, bloodGroup: bg.value }))}>{bg.label}</button>
            ))}
          </div>
          <div className="grid-2">
            <div>
              <label className="form-label-jl">Units required <span className="req">*</span></label>
              <input className="input-jl" type="number" min="1" max="100" value={form.units} onChange={e => setForm(p => ({ ...p, units: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label-jl">Required date</label>
              <input className="input-jl" type="datetime-local" value={form.requiredDate} onChange={e => setForm(p => ({ ...p, requiredDate: e.target.value }))} />
            </div>
          </div>
        </div>
        {!emergency && (
          <div className="form-section">
            <div className="form-section-title">Urgency</div>
            <div className="urgency-picker">
              {['NORMAL', 'URGENT', 'EMERGENCY'].map(u => <button type="button" key={u} className={`urgency-option ${form.urgency === u ? `selected ${u.toLowerCase()}` : ''}`} onClick={() => setForm(p => ({ ...p, urgency: u }))}>{u === 'EMERGENCY' ? '🚨' : u === 'URGENT' ? '⚠' : '•'} {u}</button>)}
            </div>
          </div>
        )}
        <div className="form-section">
          <div className="form-section-title">Location</div>
          <div className="grid-2">
            <div><label className="form-label-jl">City</label><input className="input-jl" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Hospital city" /></div>
            <div><label className="form-label-jl">State</label><input className="input-jl" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="State" /></div>
          </div>
        </div>
        {form.urgency === 'EMERGENCY' && <div className="emergency-note"><AlertTriangle size={18} /><span>Emergency requests trigger immediate compatibility matching and in-app notifications for potential donors and compatible verified blood banks.</span></div>}
        <button className="btn-primary-jl" disabled={submitting} style={{ marginTop: 8, justifyContent: 'center', background: form.urgency === 'EMERGENCY' ? 'var(--danger)' : undefined }}>
          {submitting ? 'Creating request…' : form.urgency === 'EMERGENCY' ? 'Raise Emergency Request' : 'Create Blood Request'}
        </button>
      </form>
    </div>
  );
}

function RequestRow({ request, onView, onCancel }) {
  return (
    <tr>
      <td><strong>#{request.id.slice(0, 8)}</strong></td>
      <td><BloodGroupBadge group={request.bloodGroup} /></td>
      <td>{request.units}</td>
      <td><StatusBadge status={request.urgency} /></td>
      <td><StatusBadge status={request.status} /></td>
      <td>{new Date(request.createdAt).toLocaleString()}</td>
      <td><div style={{ display: 'flex', gap: 6 }}><button className="btn-outline-jl btn-sm-jl" onClick={() => onView(request)}><Eye size={14} /> View</button>{!['FULFILLED','CANCELLED'].includes(request.status) && <button className="btn-danger-jl btn-sm-jl" onClick={() => onCancel(request.id)}><XCircle size={14} /> Cancel</button>}</div></td>
    </tr>
  );
}

function RequestDetails({ request, onBack }) {
  if (!request) return null;
  return (
    <DashboardLayout title="Request Details" subtitle={`Request #${request.id.slice(0, 8)}`}>
      <button className="btn-outline-jl" onClick={onBack} style={{ marginBottom: 16 }}><ArrowLeft size={15} /> Back to requests</button>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard icon={Droplets} label="Blood Group" value={request.bloodGroup?.replace('_POS','+').replace('_NEG','-')} />
        <StatCard icon={Droplets} label="Units" value={request.units} />
        <StatCard icon={AlertTriangle} label="Urgency" value={request.urgency} />
        <StatCard icon={CheckCircle} label="Status" value={request.status} />
      </div>
      <div className="card-jl">
        <div className="card-jl-header"><h3>Potential donor matches</h3><StatusBadge status={request.status} /></div>
        <div className="card-jl-body">
          {!request.matches?.length ? <EmptyState icon={Droplets} title="No donor matches yet" description="Matching may still be running, or no compatible eligible donor has been found." /> : <div className="match-grid">{request.matches.map(m => <div className="match-card" key={m.id}><div><strong>{m.donor?.user?.name || 'Potential donor'}</strong><div className="muted">{m.donor?.bloodGroup?.replace('_POS','+').replace('_NEG','-')} · {m.donor?.city || 'Location not provided'}</div></div><StatusBadge status={m.status} /></div>)}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API}/api/requests/hospital`); setRequests(res.data); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to load hospital requests.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const cancel = async id => {
    if (!window.confirm('Cancel this blood request?')) return;
    try { await axios.put(`${API}/api/requests/${id}/cancel`); toast.success('Request cancelled.'); load(); } catch (err) { toast.error(err.response?.data?.error || 'Could not cancel request.'); }
  };

  const pending = requests.filter(r => ['PENDING','MATCHING','MATCHED'].includes(r.status)).length;
  const emergency = requests.filter(r => r.urgency === 'EMERGENCY').length;
  const accepted = requests.filter(r => r.status === 'ACCEPTED').length;
  const fulfilled = requests.filter(r => r.status === 'FULFILLED').length;

  if (selected) return <RequestDetails request={selected} onBack={() => { setSelected(null); load(); }} />;

  const path = location.pathname;
  if (path === '/hospital/emergency-request') return <DashboardLayout title="Emergency Request" subtitle="Create an urgent request and start matching immediately."><RequestForm emergency onCreated={() => { load(); navigate('/hospital/requests'); }} /></DashboardLayout>;
  if (path === '/hospital/requests') return <DashboardLayout title="Blood Requests" subtitle="Create, monitor and manage all hospital blood requests.">
    <div className="page-toolbar"><div><h2>Blood Requests</h2><p className="muted">Every request is stored and tracked through its lifecycle.</p></div><div className="toolbar-actions"><button className="btn-outline-jl" onClick={load}><RefreshCw size={15} /> Refresh</button><button className="btn-primary-jl" onClick={() => navigate('/hospital/emergency-request')}><AlertTriangle size={15} /> Emergency</button><button className="btn-primary-jl" onClick={() => navigate('/hospital/new-request')}><PlusCircle size={15} /> New Request</button></div></div>
    {loading ? <LoadingSpinner /> : requests.length === 0 ? <EmptyState icon={Droplets} title="No blood requests" description="Create the first hospital blood request to start the workflow." action={<button className="btn-primary-jl" onClick={() => navigate('/hospital/new-request')}>Create request</button>} /> : <div className="card-jl"><div className="table-jl-wrapper"><table className="table"><thead><tr><th>ID</th><th>Blood</th><th>Units</th><th>Urgency</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>{requests.map(r => <RequestRow key={r.id} request={r} onView={setSelected} onCancel={cancel} />)}</tbody></table></div></div>}
  </DashboardLayout>;
  if (path === '/hospital/new-request') return <DashboardLayout title="New Blood Request" subtitle="Create a standard blood requirement."><RequestForm onCreated={() => { load(); navigate('/hospital/requests'); }} /></DashboardLayout>;

  return <DashboardLayout title="Hospital Dashboard">
    <div className="page-toolbar"><div><h1>Hospital Command Center</h1><p className="muted">Good to see you, <strong>{user?.name}</strong>. Monitor blood needs and emergency response.</p></div><div className="toolbar-actions"><button className="btn-outline-jl" onClick={load}><RefreshCw size={15} /> Refresh</button><button className="btn-primary-jl" onClick={() => navigate('/hospital/new-request')}><PlusCircle size={15} /> New Request</button><button className="btn-danger-jl" onClick={() => navigate('/hospital/emergency-request')}><AlertTriangle size={15} /> Emergency</button></div></div>
    <div className="grid-4" style={{ marginBottom: 20 }}><StatCard icon={Clock} label="Open Requests" value={pending} /><StatCard icon={AlertTriangle} label="Emergency" value={emergency} accentColor="#e11d48" /><StatCard icon={CheckCircle} label="Accepted" value={accepted} accentColor="#10b981" /><StatCard icon={Droplets} label="Fulfilled" value={fulfilled} accentColor="#8b5cf6" /></div>
    <div className="card-jl" style={{ marginBottom: 20 }}><div className="card-jl-header"><h3>Emergency response</h3><StatusBadge status="EMERGENCY" /></div><div className="card-jl-body"><div className="emergency-banner"><div><strong>Emergency workflow is ready.</strong><p>Use the single <b>Emergency</b> action in the page header to start donor and blood-bank matching and notify compatible participants.</p></div><div style={{display:'flex',alignItems:'center',gap:8}}><AlertTriangle size={24} color="var(--danger)" /><span className="muted">Fast matching enabled</span></div></div></div></div>
    <div className="card-jl"><div className="card-jl-header"><h3>Recent requests</h3><button className="btn-outline-jl btn-sm-jl" onClick={() => navigate('/hospital/requests')}>View all</button></div>{loading ? <LoadingSpinner /> : requests.slice(0,5).map(r => <div className="list-row" key={r.id}><div><strong>#{r.id.slice(0,8)} · {r.bloodGroup.replace('_POS','+').replace('_NEG','-')}</strong><div className="muted">{r.units} unit(s) · {new Date(r.createdAt).toLocaleString()}</div></div><div style={{display:'flex',gap:8,alignItems:'center'}}><StatusBadge status={r.urgency}/><StatusBadge status={r.status}/><button className="btn-outline-jl btn-sm-jl" onClick={() => setSelected(r)}>View</button></div></div>)}{!loading && !requests.length && <EmptyState icon={Droplets} title="No requests yet" description="Create a blood request to begin."/>}</div>
  </DashboardLayout>;
}

export { RequestForm };
