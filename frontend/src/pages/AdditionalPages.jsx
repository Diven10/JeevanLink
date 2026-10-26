import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Droplets,
  Heart,
  Calendar,
  User,
  Building2,
  Search,
  ShieldCheck,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Bell,
  RefreshCw,
  Award,
  Plus,
  X,
  HeartHandshake,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import CertificateModal from "../components/CertificateModal";
import { saveCertificate, getCertificates } from "../utils/certificates";
import { getNbtcStatus } from "../utils/nbtc";
import {
  StatCard,
  StatusBadge,
  BloodGroupBadge,
  EmptyState,
  LoadingSpinner,
  PageHeader,
} from "../components/UI";
import { API } from "../config/api";

const groups = [
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
];
const groupLabel = (g) => g?.replace("_POS", "+").replace("_NEG", "-") || g;
const api = (path, opts = {}) => axios({ url: API + path, ...opts });

export function DonorProfile() {
  const [d, setD] = useState(null),
    [loading, setLoading] = useState(true),
    [form, setForm] = useState({});
  useEffect(() => {
    api("/api/donors/me")
      .then((r) => {
        setD(r.data);
        setForm(r.data || {});
      })
      .catch(() => toast.error("Could not load profile"))
      .finally(() => setLoading(false));
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      const r = await api("/api/donors/me", { method: "PUT", data: form });
      setD({ ...d, ...r.data });
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e.response?.data?.error || "Update failed");
    }
  };
  if (loading)
    return (
      <DashboardLayout title="My Profile">
        <LoadingSpinner />
      </DashboardLayout>
    );
  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Keep your donor information current."
    >
      <div className="jl-two-col">
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>
              <User size={18} /> Personal & Location
            </h3>
          </div>
          <form className="card-jl-body" onSubmit={save}>
            <label className="form-label-jl">Gender (NBTC Indian Blood Donation Interval)</label>
            <select
              className="input-jl"
              value={form.gender || "MALE"}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="MALE">Male (90 days / 3 months interval)</option>
              <option value="FEMALE">Female (120 days / 4 months interval)</option>
              <option value="OTHER">Other (90 days interval)</option>
            </select>

            <label className="form-label-jl" style={{ marginTop: 12 }}>Address</label>
            <input
              className="input-jl"
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <label className="form-label-jl">City</label>
            <input
              className="input-jl"
              value={form.city || ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <div className="grid-2">
              <div>
                <label className="form-label-jl">Latitude</label>
                <input
                  className="input-jl"
                  value={form.latitude ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label-jl">Longitude</label>
                <input
                  className="input-jl"
                  value={form.longitude ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                />
              </div>
            </div>
            <button className="btn-primary-jl" style={{ marginTop: 18 }}>
              Save changes
            </button>
          </form>
        </div>
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>Donation Identity</h3>
            <BloodGroupBadge group={d?.bloodGroup} />
          </div>
          <div className="card-jl-body">
            <div className="profile-kv">
              <span>Eligibility</span>
              <StatusBadge status={d?.eligibility} />
            </div>
            <div className="profile-kv">
              <span>Donations</span>
              <strong>{d?.donationCount || 0}</strong>
            </div>
            <div className="profile-kv">
              <span>Last donation</span>
              <strong>
                {d?.lastDonation
                  ? new Date(d.lastDonation).toLocaleDateString()
                  : "Not recorded"}
              </strong>
            </div>
            <div className="profile-kv">
              <span>Gender</span>
              <strong>{d?.gender || "MALE"}</strong>
            </div>
            <div className="profile-kv">
              <span>NBTC Interval</span>
              <strong style={{ color: "var(--brand-primary)" }}>
                {d?.gender === "FEMALE" ? "120 Days (4 Months)" : "90 Days (3 Months)"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function DonorEligibility() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api("/api/donors/me")
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  const nbtc = getNbtcStatus(d);
  const interval = nbtc.intervalDays || 90;
  const isFemale = d?.gender === "FEMALE";

  return (
    <DashboardLayout
      title="Eligibility & NBTC India Guidelines"
      subtitle="Your current donation readiness evaluated against Indian National Blood Transfusion Council standards."
    >
      {/* NBTC Status Hero */}
      <div
        className="eligibility-hero"
        style={{
          background: nbtc.isEligible
            ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
            : "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
          color: "#fff",
        }}
      >
        <div className="eligibility-icon" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {nbtc.isEligible ? <CheckCircle size={32} /> : <Clock size={32} />}
        </div>
        <div>
          <div className="section-label" style={{ color: "rgba(255,255,255,0.8)" }}>
            Indian NBTC Compliance Status
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.75rem", margin: "4px 0 8px" }}>
            {nbtc.isEligible ? "✓ Eligible to Donate Whole Blood" : `⏳ Recovery Cooldown: ${nbtc.daysRemaining} Days Remaining`}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", margin: 0, maxWidth: 640 }}>
            {nbtc.isEligible
              ? `You satisfy the Indian standard ${interval}-day waiting period for ${isFemale ? "female" : "male"} donors. Your donation can save lives today!`
              : `Under NBTC India rules, donors must rest for ${interval} days between whole blood donations to replenish iron and red cells. Next eligible date: ${nbtc.nextEligibleDate ? new Date(nbtc.nextEligibleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}.`}
          </p>
        </div>
      </div>

      {/* Progress Bar if cooldown is active */}
      {!nbtc.isEligible && nbtc.daysRemaining > 0 && (
        <div className="card-jl" style={{ marginTop: 20, padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: "0.9rem", fontWeight: 600 }}>
            <span style={{ color: "#b45309", display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={16} /> NBTC Recovery Window Progress
            </span>
            <span>{nbtc.percent}% Complete</span>
          </div>
          <div style={{ width: "100%", height: 12, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                width: `${nbtc.percent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #f59e0b 0%, #10b981 100%)",
                borderRadius: 999,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", marginTop: 8 }}>
            <span>Last Donated: {d?.lastDonation ? new Date(d.lastDonation).toLocaleDateString('en-IN') : "—"}</span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              Can Donate Again On: {nbtc.nextEligibleDate ? new Date(nbtc.nextEligibleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid-3" style={{ marginTop: 20 }}>
        <StatCard
          icon={User}
          label="Blood Group & Gender"
          value={`${groupLabel(d?.bloodGroup)} • ${d?.gender || "MALE"}`}
        />
        <StatCard
          icon={Clock}
          label="NBTC Required Interval"
          value={isFemale ? "120 Days (4 Months)" : "90 Days (3 Months)"}
          accentColor="#e11d48"
        />
        <StatCard
          icon={Calendar}
          label="Next Eligible Date"
          value={
            nbtc.isEligible
              ? "Immediately"
              : nbtc.nextEligibleDate
              ? new Date(nbtc.nextEligibleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : "Immediately"
          }
          accentColor={nbtc.isEligible ? "#10b981" : "#d97706"}
        />
      </div>

      {/* Official NBTC Guidelines Reference Card */}
      <div className="card-jl" style={{ marginTop: 20 }}>
        <div className="card-jl-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={20} style={{ color: "var(--brand-primary)" }} />
            <h3 style={{ margin: 0 }}>Official Indian NBTC Blood Donation Criteria</h3>
          </div>
        </div>
        <div className="card-jl-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: "4px solid #e11d48" }}>
              <strong style={{ display: "block", color: "#0f172a", marginBottom: 4 }}>Whole Blood Donation Interval</strong>
              <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                • <strong>Males:</strong> Minimum 90 days (3 months) between donations.<br />
                • <strong>Females:</strong> Minimum 120 days (4 months) between donations.
              </span>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: "4px solid #3b82f6" }}>
              <strong style={{ display: "block", color: "#0f172a", marginBottom: 4 }}>Age &amp; Weight Standards</strong>
              <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                • <strong>Age:</strong> 18 to 65 years.<br />
                • <strong>Weight:</strong> Minimum 45 kg (≥50 kg required for 450ml collections).
              </span>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: "4px solid #10b981" }}>
              <strong style={{ display: "block", color: "#0f172a", marginBottom: 4 }}>Hemoglobin Level</strong>
              <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                • Minimum <strong>12.5 g/dL</strong> tested via finger-prick or automated hematology analyzer on site.
              </span>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, borderLeft: "4px solid #f59e0b" }}>
              <strong style={{ display: "block", color: "#0f172a", marginBottom: 4 }}>Vital Signs</strong>
              <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                • <strong>Blood Pressure:</strong> Systolic 100–140 mmHg, Diastolic 60–90 mmHg.<br />
                • <strong>Pulse:</strong> Regular, 60–100 beats/minute.
              </span>
            </div>
          </div>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #e2e8f0", fontSize: "0.825rem", color: "#64748b" }}>
            ℹ️ Source: <em>National Blood Transfusion Council (NBTC), Directorate General of Health Services, Ministry of Health and Family Welfare (MoHFW), Government of India.</em>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function DonorDonations() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [localDonations, setLocalDonations] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({
    units: 1,
    date: new Date().toISOString().slice(0, 10),
    location: "Central Blood Bank",
  });

  const loadLocalDonations = () => {
    if (!user?.email) return [];
    try {
      const saved = localStorage.getItem(`jl_donations_${user.email}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    api("/api/donors/me")
      .then((r) => setD(r.data))
      .catch(() => {});
    api("/api/blood-banks")
      .then((r) => setBanks(r.data))
      .catch(() => {});
    setLocalDonations(loadLocalDonations());
  }, [user]);

  // Combine server donations and user-recorded donations
  const serverDonations = d?.donations || [];
  const allDonations = [...localDonations, ...serverDonations];

  const handleRecordDonation = (e) => {
    e.preventDefault();
    const newDonation = {
      id: "rec-" + Date.now().toString(36),
      date: new Date(form.date).toISOString(),
      units: parseInt(form.units) || 1,
      location: form.location || "Central Blood Bank",
      isLocal: true,
    };

    const updated = [newDonation, ...localDonations];
    setLocalDonations(updated);
    if (user?.email) {
      localStorage.setItem(`jl_donations_${user.email}`, JSON.stringify(updated));
    }

    // Generate appreciation certificate
    const cert = {
      id: `JL-BLD-${Date.now().toString(36).toUpperCase()}`,
      type: "BLOOD_DONATION",
      title: "Certificate of Appreciation",
      subtitle: "Voluntary Blood Donation Honor",
      recipientName: user?.name || "Life Saver",
      bloodGroup: d?.bloodGroup ? groupLabel(d.bloodGroup) : "O+",
      details: `${form.units || 1} Unit(s) of whole blood successfully donated on ${new Date(form.date).toLocaleDateString()} at ${form.location || "Central Blood Bank"}.`,
      date: form.date,
      issuedBy: "JeevanLink National Blood Transfusion Network",
    };
    saveCertificate(user?.email, cert);

    toast.success("✓ Donation recorded! Appreciation Certificate generated.");
    setShowRecordModal(false);
    setSelectedCert(cert);
  };

  const viewCertForDonation = (donation) => {
    const certId = `JL-BLD-${donation.id.slice(0, 8).toUpperCase()}`;
    const cert = {
      id: certId,
      type: "BLOOD_DONATION",
      title: "Certificate of Appreciation",
      subtitle: "Voluntary Blood Donation Honor",
      recipientName: user?.name || "Life Saver",
      bloodGroup: d?.bloodGroup ? groupLabel(d.bloodGroup) : "O+",
      details: `${donation.units || 1} Unit(s) of whole blood donated on ${new Date(donation.date).toLocaleDateString()} at ${donation.location || "JeevanLink Center"}.`,
      date: donation.date,
      issuedBy: "JeevanLink National Blood Transfusion Network",
    };
    saveCertificate(user?.email, cert);
    setSelectedCert(cert);
  };

  const totalDonationsCount = (d?.donationCount || 0) + localDonations.length;
  const totalUnits = allDonations.reduce((a, x) => a + (x.units || 0), 0);

  return (
    <DashboardLayout
      title="Donation History"
      subtitle="A chronological record of your contributions and earned certificates."
    >
      <div className="grid-3">
        <StatCard
          icon={Droplets}
          label="Total Donations"
          value={totalDonationsCount}
          accentColor="#e11d48"
        />
        <StatCard
          icon={Heart}
          label="Units Donated"
          value={totalUnits}
          accentColor="#3b82f6"
        />
        <StatCard
          icon={Award}
          label="Official Certificates"
          value={`${allDonations.length} Available`}
          accentColor="#10b981"
        />
      </div>

      <div className="card-jl" style={{ marginTop: 20 }}>
        <div className="card-jl-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ margin: 0 }}>Completed Donations</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              Every completed donation is eligible for an official appreciation certificate.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-primary-jl"
              onClick={() => setShowRecordModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={16} /> Record Completed Donation
            </button>
            <Link
              to="/donor/certificates"
              className="btn-outline-jl"
              style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
            >
              <Award size={16} /> All Certificates
            </Link>
          </div>
        </div>

        {!allDonations.length ? (
          <EmptyState
            icon={Droplets}
            title="No donations recorded yet"
            description="Record a completed donation to generate your official certificate of appreciation."
            action={
              <button
                className="btn-primary-jl"
                onClick={() => setShowRecordModal(true)}
                style={{ marginTop: 10 }}
              >
                <Plus size={16} /> Record Donation Now
              </button>
            }
          />
        ) : (
          <div className="table-jl-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Units</th>
                  <th>Location</th>
                  <th>Record Type</th>
                  <th>Appreciation Certificate</th>
                </tr>
              </thead>
              <tbody>
                {allDonations.map((x) => (
                  <tr key={x.id}>
                    <td>{new Date(x.date).toLocaleDateString()}</td>
                    <td><strong>{x.units} unit{x.units > 1 ? "s" : ""}</strong></td>
                    <td>{x.location || "Central Blood Bank"}</td>
                    <td>
                      <span className={`badge-jl badge-${x.isLocal ? "info" : "success"}`}>
                        {x.isLocal ? "Recorded" : "Verified"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-outline-jl"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.825rem",
                          padding: "4px 10px",
                          color: "#be123c",
                          borderColor: "#fecdd3",
                          background: "#fff1f2",
                        }}
                        onClick={() => viewCertForDonation(x)}
                      >
                        <Award size={14} /> View Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Donation Modal */}
      {showRecordModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={() => setShowRecordModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={20} style={{ color: "var(--brand-primary)" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Record Completed Donation</h3>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordDonation} style={{ padding: "1.5rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: 0, marginBottom: "1.25rem" }}>
                Record your donation to automatically generate your official JeevanLink Certificate of Appreciation.
              </p>

              <label className="form-label-jl">Donation Date</label>
              <input
                type="date"
                className="input-jl"
                required
                value={form.date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />

              <label className="form-label-jl" style={{ marginTop: 12 }}>Units Donated</label>
              <select
                className="input-jl"
                value={form.units}
                onChange={(e) => setForm({ ...form, units: e.target.value })}
              >
                <option value="1">1 Unit (Standard Whole Blood - 450ml)</option>
                <option value="2">2 Units (Double Red Blood Cells)</option>
                <option value="3">3 Units</option>
              </select>

              <label className="form-label-jl" style={{ marginTop: 12 }}>Donation Location / Blood Bank</label>
              <input
                type="text"
                className="input-jl"
                required
                placeholder="e.g. Central Blood Bank, Metro Hospital Camp"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                list="bank-suggestions"
              />
              <datalist id="bank-suggestions">
                {banks.map((b) => (
                  <option key={b.id} value={`${b.user?.name || "Blood Bank"} (${b.city || "Main"})`} />
                ))}
              </datalist>

              <div style={{ display: "flex", gap: 10, marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn-outline-jl"
                  onClick={() => setShowRecordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-jl">
                  <Award size={16} /> Save &amp; Generate Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </DashboardLayout>
  );
}

export function DonorAppointments() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [banks, setBanks] = useState([]);
  const [donor, setDonor] = useState(null);
  
  // Suggested next date: tomorrow at 10:00 AM
  const getTomorrowDefault = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    bloodBankId: "",
    scheduledAt: getTomorrowDefault(),
    notes: "",
  });

  const load = () =>
    api("/api/donors/appointments")
      .then((r) => setItems(r.data))
      .catch(() => {});

  useEffect(() => {
    load();
    api("/api/donors/me")
      .then((r) => {
        setDonor(r.data);
        const nbtc = getNbtcStatus(r.data);
        if (!nbtc.isEligible && nbtc.nextEligibleDate) {
          const earliestDate = new Date(nbtc.nextEligibleDate);
          earliestDate.setHours(10, 0, 0, 0);
          setForm((prev) => ({
            ...prev,
            scheduledAt: earliestDate.toISOString().slice(0, 16),
          }));
        }
      })
      .catch(() => {});

    api("/api/blood-banks")
      .then((r) => {
        setBanks(r.data);
        if (r.data?.length > 0) {
          setForm((prev) => ({
            ...prev,
            bloodBankId: prev.bloodBankId || r.data[0].id,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const nbtc = getNbtcStatus(donor);

  const book = async (e) => {
    e.preventDefault();
    if (!form.bloodBankId) {
      return toast.error("Please select a blood bank");
    }

    const appointmentDate = new Date(form.scheduledAt);
    if (nbtc.nextEligibleDate && appointmentDate < nbtc.nextEligibleDate) {
      const nextFormatted = new Date(nbtc.nextEligibleDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return toast.error(
        `Under Indian NBTC guidelines, you can only donate after ${nextFormatted} (${nbtc.daysRemaining} days remaining in cooldown).`
      );
    }

    try {
      await api("/api/donors/appointments", { method: "POST", data: form });
      const chosenBank = banks.find((b) => b.id === form.bloodBankId);
      const formattedDate = new Date(form.scheduledAt).toLocaleString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      toast.success(
        `✓ Appointment booked for ${formattedDate} at ${chosenBank?.user?.name || "Blood Bank"}!`
      );
      setForm({
        bloodBankId: banks[0]?.id || "",
        scheduledAt: getTomorrowDefault(),
        notes: "",
      });
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Booking failed");
    }
  };

  const cancel = async (id) => {
    try {
      await api("/api/donors/appointments/" + id, {
        method: "PUT",
        data: { action: "CANCEL" },
      });
      toast.success("Appointment cancelled");
      load();
    } catch (e) {
      toast.error("Could not cancel");
    }
  };

  const minBookingDate = nbtc.nextEligibleDate && !nbtc.isEligible
    ? new Date(nbtc.nextEligibleDate).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  return (
    <DashboardLayout
      title="Donation Appointments"
      subtitle="Book, review or reschedule your blood donation appointment under Indian NBTC standards."
    >
      <div className="jl-two-col">
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>
              <Calendar size={18} /> Schedule Donation Appointment
            </h3>
          </div>
          <form className="card-jl-body" onSubmit={book}>
            {!nbtc.isEligible && nbtc.daysRemaining > 0 ? (
              <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", padding: "12px 14px", borderRadius: 8, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#b45309", fontWeight: 700, fontSize: "0.875rem" }}>
                  <Clock size={16} /> NBTC Recovery Cooldown Active ({nbtc.daysRemaining} days left)
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#92400e" }}>
                  Per Indian NBTC rules ({donor?.gender === "FEMALE" ? "120 days for female" : "90 days for male"} interval), the earliest eligible donation date is{" "}
                  <strong>{nbtc.nextEligibleDate ? new Date(nbtc.nextEligibleDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}</strong>. The picker has been preset accordingly.
                </p>
              </div>
            ) : (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#065f46", fontWeight: 600, fontSize: "0.875rem" }}>
                  <CheckCircle size={16} /> NBTC Criteria Satisfied
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#047857" }}>
                  You are fully eligible to schedule your next whole blood donation immediately.
                </p>
              </div>
            )}

            <label className="form-label-jl">Select Blood Bank</label>
            <select
              className="input-jl"
              required
              value={form.bloodBankId}
              onChange={(e) =>
                setForm({ ...form, bloodBankId: e.target.value })
              }
            >
              <option value="">Select a blood bank</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.user?.name || "Blood Bank"} — {b.city || "Main Center"}
                </option>
              ))}
            </select>

            <label className="form-label-jl" style={{ marginTop: 12 }}>
              Appointment Date &amp; Time
            </label>
            <input
              className="input-jl"
              required
              type="datetime-local"
              value={form.scheduledAt}
              min={minBookingDate}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
            />

            <label className="form-label-jl" style={{ marginTop: 12 }}>
              Notes / Special Requests (Optional)
            </label>
            <input
              type="text"
              className="input-jl"
              placeholder="e.g. First-time donor, prefer morning slot"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <button
              className="btn-primary-jl"
              style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
            >
              <Calendar size={16} /> Confirm Donation Appointment
            </button>
          </form>
        </div>

        <div className="card-jl">
          <div className="card-jl-header">
            <h3>My Scheduled Appointments</h3>
          </div>
          <div className="card-jl-body">
            {!items.length ? (
              <EmptyState
                icon={Calendar}
                title="No active appointments"
                description="Book an appointment on the left to schedule your next life-saving donation."
              />
            ) : (
              items.map((a) => (
                <div className="list-row" key={a.id}>
                  <div>
                    <strong>{a.bloodBank?.user?.name || "Blood Bank"}</strong>
                    <div className="muted" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <Clock size={13} />
                      {new Date(a.scheduledAt).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <StatusBadge status={a.status} />
                    {a.status === "BOOKED" && (
                      <button
                        className="btn-danger-jl"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        onClick={() => cancel(a.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function RecipientDashboard() {
  const [profile, setProfile] = useState(null),
    [requests, setRequests] = useState([]);
  useEffect(() => {
    api("/api/recipients/me")
      .then((r) => setProfile(r.data))
      .catch(() => {});
    api("/api/requests/recipient")
      .then((r) => setRequests(r.data))
      .catch(() => {});
  }, []);
  return (
    <DashboardLayout
      title="Recipient Dashboard"
      subtitle="Track blood needs and request progress."
    >
      <div className="grid-4">
        <StatCard
          icon={Droplets}
          label="Blood Group"
          value={groupLabel(profile?.bloodGroup)}
        />
        <StatCard
          icon={FileText}
          label="Active Requests"
          value={
            requests.filter(
              (r) => !["FULFILLED", "CANCELLED"].includes(r.status),
            ).length
          }
        />
        <StatCard
          icon={CheckCircle}
          label="Fulfilled"
          value={requests.filter((r) => r.status === "FULFILLED").length}
        />
        <StatCard icon={Clock} label="Total Requests" value={requests.length} />
      </div>
      <div className="card-jl" style={{ marginTop: 20 }}>
        <div className="card-jl-header">
          <h3>My requests</h3>
          <a className="btn-primary-jl" href="/recipient/requests/new">
            + New request
          </a>
        </div>
        {!requests.length ? (
          <EmptyState
            icon={Droplets}
            title="No requests yet"
            description="Create a request when blood is needed."
          />
        ) : (
          <div className="table-jl-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Blood</th>
                  <th>Units</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <BloodGroupBadge group={r.bloodGroup} />
                    </td>
                    <td>{r.units}</td>
                    <td>
                      <StatusBadge status={r.urgency} />
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export function RecipientRequest() {
  const [form, setForm] = useState({
    bloodGroup: "O_NEG",
    units: 1,
    urgency: "NORMAL",
    requiredDate: "",
  });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/api/requests", { method: "POST", data: form });
      toast.success("Blood request submitted");
      window.location.href = "/recipient/dashboard";
    } catch (e) {
      toast.error(e.response?.data?.error || "Request failed");
    }
  };
  return (
    <DashboardLayout
      title="New Blood Request"
      subtitle="Submit a request and track its progress."
    >
      <div className="card-jl form-card">
        <div className="card-jl-header">
          <h3>Blood requirement</h3>
        </div>
        <form className="card-jl-body" onSubmit={submit}>
          <div className="grid-2">
            <div>
              <label className="form-label-jl">Blood Group</label>
              <select
                className="input-jl"
                value={form.bloodGroup}
                onChange={(e) =>
                  setForm({ ...form, bloodGroup: e.target.value })
                }
              >
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {groupLabel(g)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label-jl">Units</label>
              <input
                className="input-jl"
                type="number"
                min="1"
                value={form.units}
                onChange={(e) => setForm({ ...form, units: e.target.value })}
              />
            </div>
          </div>
          <label className="form-label-jl">Urgency</label>
          <select
            className="input-jl"
            value={form.urgency}
            onChange={(e) => setForm({ ...form, urgency: e.target.value })}
          >
            <option>NORMAL</option>
            <option>URGENT</option>
            <option>EMERGENCY</option>
          </select>
          <label className="form-label-jl">Required date</label>
          <input
            className="input-jl"
            type="date"
            value={form.requiredDate}
            onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
          />
          <button className="btn-primary-jl" style={{ marginTop: 18 }}>
            Submit request
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export function NotificationsPage() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await api("/api/notifications");
      setItems(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      setError(e.response?.data?.error || "Could not load notifications");
      toast.error("Could not load notifications");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const read = async (id) => {
    try {
      await api("/api/notifications/" + id + "/read", { method: "PUT" });
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (e) {
      toast.error(
        e.response?.data?.error || "Could not mark notification as read",
      );
    }
  };
  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Request alerts, appointment updates and system messages."
    >
      <div className="page-toolbar">
        <div>
          <h2>Notifications</h2>
          <p className="muted">Your account-specific alerts appear here.</p>
        </div>
        <button className="btn-outline-jl" onClick={load}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>
      {loading ? (
        <LoadingSpinner text="Loading notifications…" />
      ) : error ? (
        <div className="card-jl">
          <div className="card-jl-body">
            <EmptyState
              icon={AlertTriangle}
              title="Notifications unavailable"
              description={error}
              action={
                <button className="btn-primary-jl" onClick={load}>
                  Try again
                </button>
              }
            />
          </div>
        </div>
      ) : !items.length ? (
        <div className="card-jl">
          <EmptyState
            icon={CheckCircle}
            title="You're all caught up"
            description="New emergency requests, appointments and system alerts will appear here."
          />
        </div>
      ) : (
        <div className="notification-list">
          {items.map((n) => (
            <div
              className={`notification-card ${!n.isRead ? "unread" : ""}`}
              key={n.id}
            >
              <div className="notification-icon">
                <BellIcon />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="notification-card-title">{n.title}</div>
                <p>{n.message}</p>
                <span className="muted">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              {!n.isRead && (
                <button
                  className="btn-outline-jl btn-sm-jl"
                  onClick={() => read(n.id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
function BellIcon() {
  return <Bell size={20} />;
}

export function OrganDonation() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    bloodGroup: "O_POS",
    organs: [],
    medicalHistory: "",
    emergencyContact: "",
    consent: false,
  });
  const [existing, setExisting] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  const organs = [
    "KIDNEY",
    "LIVER",
    "HEART",
    "LUNGS",
    "PANCREAS",
    "CORNEA",
    "BONE_MARROW",
    "SKIN",
  ];

  useEffect(() => {
    api("/api/organ-donation/me")
      .then((r) => {
        setExisting(r.data);
        if (r.data && user?.email) {
          // Auto-sync certificate for existing pledge
          const organList = r.data.organs ? r.data.organs.replace(/,/g, ", ") : "Vital Organs";
          const cert = {
            id: `JL-ORG-${r.data.id?.slice(0, 8).toUpperCase() || "HERO"}`,
            type: "ORGAN_PLEDGE",
            title: "Certificate of Appreciation",
            subtitle: "Voluntary Organ Donor Pledge of Honor",
            recipientName: user?.name || "Life Saver",
            bloodGroup: r.data.bloodGroup ? groupLabel(r.data.bloodGroup) : "O+",
            details: `Pledged organs for life-saving transplantation: ${organList}.`,
            date: r.data.createdAt || new Date().toISOString(),
            issuedBy: "JeevanLink National Organ & Tissue Donation Registry",
          };
          saveCertificate(user.email, cert);
        }
      })
      .catch(() => {});
  }, [user]);

  const toggle = (o) =>
    setForm({
      ...form,
      organs: form.organs.includes(o)
        ? form.organs.filter((x) => x !== o)
        : [...form.organs, o],
    });

  const getOrganCertificate = (data) => {
    const organList = data.organs
      ? Array.isArray(data.organs)
        ? data.organs.join(", ")
        : data.organs.replace(/,/g, ", ")
      : form.organs.join(", ") || "Vital Organs";
    return {
      id: `JL-ORG-${Date.now().toString(36).toUpperCase()}`,
      type: "ORGAN_PLEDGE",
      title: "Certificate of Appreciation",
      subtitle: "Voluntary Organ Donor Pledge of Honor",
      recipientName: user?.name || "Life Saver",
      bloodGroup: groupLabel(data.bloodGroup || form.bloodGroup),
      details: `Pledged organs for life-saving transplantation: ${organList}.`,
      date: new Date().toISOString(),
      issuedBy: "JeevanLink National Organ & Tissue Donation Registry",
    };
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent)
      return toast.error("Please provide explicit digital consent");
    if (!form.organs.length)
      return toast.error("Please select at least one organ to pledge");

    try {
      const r = await api("/api/organ-donation/register", {
        method: "POST",
        data: { ...form, organs: form.organs.join(",") },
      });
      const donorRecord = r.data.organDonor || form;
      setExisting(donorRecord);

      // Generate & save appreciation certificate
      const cert = getOrganCertificate(donorRecord);
      saveCertificate(user?.email, cert);

      toast.success("✓ Organ donor registration saved! Appreciation Certificate issued.");
      setSelectedCert(cert);
    } catch (e) {
      toast.error(e.response?.data?.error || "Registration failed");
    }
  };

  const openExistingCertificate = () => {
    if (!existing) return;
    const cert = getOrganCertificate(existing);
    saveCertificate(user?.email, cert);
    setSelectedCert(cert);
  };

  return (
    <DashboardLayout
      title="Organ Donation"
      subtitle="Voluntary pledge with explicit digital consent."
    >
      <div className="organ-hero">
        <div>
          <div className="section-label">Give someone another tomorrow</div>
          <h1>Your pledge can help save up to 8 lives.</h1>
          <p>
            JeevanLink records your voluntary organ donation consent and
            awards you an official digital Certificate of Appreciation.
          </p>
        </div>
        <Heart size={70} />
      </div>

      {/* Hero Certificate banner if already pledged */}
      {existing && (
        <div
          style={{
            background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
            border: "1.5px solid #a7f3d0",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#059669",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#065f46" }}>
                Official Organ Donor Pledge Certificate Issued
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#047857" }}>
                Thank you for your noble commitment. Your verified appreciation certificate is ready.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="btn-primary-jl"
              style={{ background: "#059669", borderColor: "#059669" }}
              onClick={openExistingCertificate}
            >
              <Award size={16} /> View Certificate
            </button>
            <Link
              to="/donor/certificates"
              className="btn-outline-jl"
              style={{ textDecoration: "none", color: "#065f46", borderColor: "#a7f3d0" }}
            >
              All Certificates
            </Link>
          </div>
        </div>
      )}

      <div className="card-jl form-card">
        <div className="card-jl-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Organ Pledge Form</h3>
          {existing && <StatusBadge status="ACCEPTED" />}
        </div>
        <form className="card-jl-body" onSubmit={submit}>
          <label className="form-label-jl">Blood Group</label>
          <select
            className="input-jl"
            value={form.bloodGroup}
            onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {groupLabel(g)}
              </option>
            ))}
          </select>
          <label className="form-label-jl">Organs to pledge</label>
          <div className="organ-grid">
            {organs.map((o) => (
              <button
                type="button"
                className={`organ-choice ${form.organs.includes(o) ? "selected" : ""}`}
                key={o}
                onClick={() => toggle(o)}
              >
                <Heart size={18} />
                {o.replace("_", " ")}
              </button>
            ))}
          </div>
          <div className="grid-2">
            <div>
              <label className="form-label-jl">Medical history (Optional)</label>
              <textarea
                className="input-jl"
                placeholder="Any known conditions or previous surgeries"
                value={form.medicalHistory}
                onChange={(e) =>
                  setForm({ ...form, medicalHistory: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label-jl">Emergency contact details</label>
              <input
                className="input-jl"
                placeholder="Next of kin name and phone"
                value={form.emergencyContact}
                onChange={(e) =>
                  setForm({ ...form, emergencyContact: e.target.value })
                }
              />
            </div>
          </div>
          <label className="consent-box">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            />
            <span>
              I provide explicit digital consent to register as an organ donor.
              Final allocation remains with authorized medical/legal personnel.
            </span>
          </label>
          <button className="btn-primary-jl" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} /> Save Pledge &amp; Get Certificate
          </button>
        </form>
      </div>

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </DashboardLayout>
  );
}

export function OrganRequests() {
  const [form, setForm] = useState({
      organType: "KIDNEY",
      bloodGroup: "O_POS",
      urgency: "URGENT",
      patientName: "",
      patientDetails: "",
      city: "",
    }),
    [matches, setMatches] = useState([]);
  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api("/api/organ-donation/requests", {
        method: "POST",
        data: form,
      });
      setMatches(r.data.potentialMatches || []);
      toast.success(r.data.message);
    } catch (e) {
      toast.error(e.response?.data?.error || "Could not create request");
    }
  };
  return (
    <DashboardLayout
      title="Organ Requests"
      subtitle="Potential matches are suggestions only and require medical/legal review."
    >
      <div className="jl-two-col">
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>
              <Heart size={18} /> New organ request
            </h3>
          </div>
          <form className="card-jl-body" onSubmit={submit}>
            <label className="form-label-jl">Organ</label>
            <select
              className="input-jl"
              value={form.organType}
              onChange={(e) => setForm({ ...form, organType: e.target.value })}
            >
              {[
                "KIDNEY",
                "LIVER",
                "HEART",
                "LUNGS",
                "PANCREAS",
                "CORNEA",
                "OTHER",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <label className="form-label-jl">Blood group</label>
            <select
              className="input-jl"
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
            >
              {groups.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <label className="form-label-jl">Patient name</label>
            <input
              className="input-jl"
              value={form.patientName}
              onChange={(e) =>
                setForm({ ...form, patientName: e.target.value })
              }
            />
            <label className="form-label-jl">Patient details</label>
            <textarea
              className="input-jl"
              value={form.patientDetails}
              onChange={(e) =>
                setForm({ ...form, patientDetails: e.target.value })
              }
            />
            <label className="form-label-jl">City</label>
            <input
              className="input-jl"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <button className="btn-primary-jl" style={{ marginTop: 14 }}>
              Find potential matches
            </button>
          </form>
        </div>
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>Potential matches</h3>
          </div>
          <div className="card-jl-body">
            {!matches.length ? (
              <EmptyState
                icon={Heart}
                title="No matches yet"
                description="Submit a request to search registered organ donors."
              />
            ) : (
              matches.map((m) => (
                <div className="match-card" key={m.id}>
                  <div className="avatar-circle">
                    {m.name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <strong>{m.name}</strong>
                    <div className="muted">
                      {groupLabel(m.bloodGroup)} • Potential Match
                    </div>
                  </div>
                  <span className="badge-jl badge-warning">Medical review</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function BloodSearch() {
  const [group, setGroup] = useState("O_NEG"),
    [banks, setBanks] = useState([]),
    [loading, setLoading] = useState(false);
  const search = () => {
    setLoading(true);
    api("/api/blood-banks")
      .then((r) =>
        setBanks(
          r.data.filter((b) =>
            b.inventory?.some(
              (i) =>
                i.bloodGroup === group &&
                i.units > 0 &&
                (!i.expiryDate || new Date(i.expiryDate) >= new Date()),
            ),
          ),
        ),
      )
      .catch(() => toast.error("Search failed"))
      .finally(() => setLoading(false));
  };
  useEffect(search, []);
  return (
    <>
      <NavigationMini />
      <section className="public-section">
        <div className="container">
          <div className="public-heading">
            <div className="section-label">Find blood</div>
            <h1>Search available blood</h1>
            <p>Find registered blood banks with available compatible stock.</p>
          </div>
          <div className="search-panel">
            <select
              className="input-jl"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {groups.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <button className="btn-primary-jl" onClick={search}>
              <Search size={18} /> Search
            </button>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="result-grid">
              {banks.map((b) => {
                const i = b.inventory.find((x) => x.bloodGroup === group);
                return (
                  <div className="result-card" key={b.id}>
                    <div className="result-icon">
                      <Building2 />
                    </div>
                    <h3>{b.user?.name}</h3>
                    <p>
                      <MapPin size={14} /> {b.city || "Registered location"}
                    </p>
                    <strong>{i?.units || 0} units</strong>
                    <span className="badge-jl badge-success">Available</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
function NavigationMini() {
  return (
    <div className="mini-nav">
      <a href="/" className="brand-mini">
        🩸 JeevanLink
      </a>
      <a href="/login">Login</a>
    </div>
  );
}

export function Awareness() {
  const faqs = [
    [
      "What is the minimum time period between blood donations in India?",
      "According to the National Blood Transfusion Council (NBTC), Ministry of Health & Family Welfare, Government of India: Men can donate whole blood once every 3 months (90 days), and women can donate once every 4 months (120 days). Platelet apheresis donations require a minimum 48-hour gap (up to 24 times a year).",
    ],
    [
      "Why is there a longer interval for female donors in India?",
      "The 120-day interval for females accounts for monthly menstrual iron loss and naturally lower baseline ferritin (iron storage) reserves. This prevents post-donation iron deficiency and anemia.",
    ],
    [
      "Can anyone donate blood?",
      "Eligible donors must be aged 18–65 years, weigh at least 45 kg (≥50 kg for 450ml collections), have a minimum hemoglobin level of 12.5 g/dL, and meet vital health criteria verified on-site.",
    ],
    [
      "How does emergency matching work?",
      "A hospital emergency request triggers compatibility-based matching and in-app notifications to eligible donors who have satisfied their NBTC cooldown window and blood banks nearby.",
    ],
    [
      "Does JeevanLink allocate organs?",
      "No. Organ matching outputs are suggestions only and require authorized medical and legal review.",
    ],
    [
      "How is data protected?",
      "The application uses authentication, role-based access control and audit logging; production deployment should use HTTPS and appropriate encryption.",
    ],
  ];
  return (
    <>
      <NavigationMini />
      <section className="public-section">
        <div className="container">
          <div className="public-heading">
            <div className="section-label">Learn & share</div>
            <h1>Awareness & FAQ</h1>
            <p>Educational information about blood and organ donation.</p>
          </div>
          <div className="article-grid">
            <article className="info-card">
              <Droplets />
              <h3>Blood donation</h3>
              <p>
                Voluntary blood donation supports hospitals and emergency care.
                Use the system's eligibility checker as a software aid, not as a
                substitute for medical screening.
              </p>
            </article>
            <article className="info-card">
              <Heart />
              <h3>Organ donation</h3>
              <p>
                JeevanLink records voluntary pledges and compatibility
                suggestions. Final allocation remains outside the system.
              </p>
            </article>
            <article className="info-card">
              <ShieldCheck />
              <h3>Responsible access</h3>
              <p>
                Personal and health information should only be accessed by the
                user and authorized personnel according to role.
              </p>
            </article>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
