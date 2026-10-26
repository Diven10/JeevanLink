import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { API } from "../config/api";
import DashboardLayout from "../components/DashboardLayout";
import {
  StatCard,
  StatusBadge,
  BloodGroupBadge,
  EmptyState,
  LoadingSpinner,
} from "../components/UI";
import {
  Heart,
  Droplets,
  CheckCircle,
  Bell,
  AlertTriangle,
  Award,
  Calendar,
  X,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { getNbtcStatus } from "../utils/nbtc";

function formatBG(bg) {
  return bg?.replace("_POS", "+").replace("_NEG", "-") || bg;
}

function EmergencyNotifCard({ match, onRespond }) {
  const hosp = match.bloodRequest?.hospital?.user?.name || "Unknown Hospital";
  const bg = formatBG(match.bloodRequest?.bloodGroup);
  const units = match.bloodRequest?.units;

  return (
    <div className="emergency-notif-card">
      <div className="emergency-notif-header">
        <span className="emergency-notif-badge">🚨 Emergency</span>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            marginLeft: "auto",
          }}
        >
          {new Date(match.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="emergency-notif-info">
        <div className="emergency-notif-info-row">
          <Droplets size={15} />
          <strong style={{ color: "var(--brand-primary)" }}>{bg}</strong> blood
          required
        </div>
        <div className="emergency-notif-info-row">
          <span style={{ width: 15 }}>💧</span>
          <strong>
            {units} unit{units > 1 ? "s" : ""}
          </strong>{" "}
          needed
        </div>
        <div className="emergency-notif-info-row">
          <span style={{ width: 15 }}>🏥</span>
          {hosp}
        </div>
      </div>
      {match.status === "POTENTIAL" && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-primary-jl"
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => onRespond(match.id, "ACCEPTED")}
          >
            <CheckCircle size={15} /> Accept Request
          </button>
          <button
            className="btn-outline-jl"
            style={{
              flex: 1,
              justifyContent: "center",
              color: "var(--danger)",
              borderColor: "var(--danger)",
            }}
            onClick={() => onRespond(match.id, "DECLINED")}
          >
            Decline
          </button>
        </div>
      )}
      {match.status !== "POTENTIAL" && (
        <div
          style={{
            textAlign: "center",
            paddingTop: 8,
            fontSize: "0.875rem",
            fontWeight: 600,
            color:
              match.status === "ACCEPTED"
                ? "var(--success)"
                : "var(--text-muted)",
          }}
        >
          {match.status === "ACCEPTED"
            ? "✓ Donation recorded"
            : `Status: ${match.status}`}
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
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [banks, setBanks] = useState([]);
  const [submittingAppointment, setSubmittingAppointment] = useState(false);
  const [scheduledAppointment, setScheduledAppointment] = useState(null);
  const { user } = useAuth();

  const getTomorrowDefault = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [donateForm, setDonateForm] = useState({
    bloodBankId: "",
    scheduledAt: getTomorrowDefault(),
    notes: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [mRes, nRes, dRes] = await Promise.all([
        axios.get(`${API}/api/matches/donor`),
        axios.get(`${API}/api/notifications`),
        axios.get(`${API}/api/donors/me`),
      ]);
      setMatches(mRes.data);
      setNotifications(nRes.data);
      setProfile(dRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openDonateModal = async () => {
    setDonateModalOpen(true);
    setScheduledAppointment(null);
    try {
      const res = await axios.get(`${API}/api/blood-banks`);
      setBanks(res.data);
      const currNbtc = getNbtcStatus(profile);
      const initialDate = (!currNbtc.isEligible && currNbtc.nextEligibleDate)
        ? new Date(currNbtc.nextEligibleDate).toISOString().slice(0, 16)
        : getTomorrowDefault();

      if (res.data?.length > 0) {
        setDonateForm((prev) => ({
          ...prev,
          bloodBankId: prev.bloodBankId || res.data[0].id,
          scheduledAt: initialDate,
        }));
      }
    } catch {
      toast.error("Could not load blood banks");
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!donateForm.bloodBankId) {
      return toast.error("Please select a blood bank");
    }
    setSubmittingAppointment(true);
    try {
      const res = await axios.post(`${API}/api/donors/appointments`, donateForm);
      const chosenBank = banks.find((b) => b.id === donateForm.bloodBankId);
      const formattedDate = new Date(donateForm.scheduledAt).toLocaleString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      setScheduledAppointment({
        ...res.data,
        bankName: chosenBank?.user?.name || "Central Blood Bank",
        formattedDate,
      });
      toast.success(`✓ Donation appointment confirmed for ${formattedDate}!`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Appointment booking failed");
    } finally {
      setSubmittingAppointment(false);
    }
  };

  const handleRespond = async (matchId, status) => {
    try {
      await axios.put(`${API}/api/matches/${matchId}/respond`, { status });
      toast.success(
        status === "ACCEPTED"
          ? "✓ Request accepted! The hospital has been notified."
          : "Request declined.",
      );
      fetchAll();
    } catch {
      toast.error("Failed to respond");
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`);
    } catch {}
  };

  const pending = matches.filter((m) => m.status === "POTENTIAL").length;
  const accepted = matches.filter((m) => m.status === "ACCEPTED").length;
  const unread = notifications.filter((n) => !n.isRead).length;
  return (
    <DashboardLayout title="Donor Dashboard">
      {/* Welcome & Actions */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
            Good to see you, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            You're making a difference. Here's your donor overview.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn-primary-jl"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: "0.95rem" }}
            onClick={openDonateModal}
          >
            <Droplets size={18} /> Donate Blood Now
          </button>
          <Link
            to="/donor/certificates"
            className="btn-outline-jl"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "10px 16px" }}
          >
            <Award size={18} /> Certificates
          </Link>
        </div>
      </div>

      {/* Stats */}
      {(() => {
        const nbtc = getNbtcStatus(profile);
        return (
          <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
            <StatCard
              icon={Heart}
              label="NBTC Eligibility"
              value={
                nbtc.isEligible ? "✓ Eligible" : `⏳ Cooldown (${nbtc.daysRemaining}d)`
              }
              accentColor={
                nbtc.isEligible ? "#10b981" : "#f59e0b"
              }
            />
            <StatCard
              icon={Clock}
              label="Interval Rule"
              value={profile?.gender === "FEMALE" ? "120 Days (Female)" : "90 Days (Male)"}
              accentColor="#3b82f6"
            />
            <StatCard
              icon={Droplets}
              label="Total Donations"
              value={profile?.donationCount ?? 0}
              accentColor="#e11d48"
            />
            <StatCard
              icon={Bell}
              label="Unread Alerts"
              value={unread}
              accentColor="#8b5cf6"
            />
          </div>
        );
      })()}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "1.5rem",
        }}
      >
        {/* Profile & Notifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Profile Card */}
          <div className="card-jl">
            <div className="card-jl-header">
              <h3>My Profile</h3>
            </div>
            <div className="card-jl-body">
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--brand-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    margin: "0 auto 12px",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {user?.email}
                </div>
              </div>
              {(() => {
                const nbtc = getNbtcStatus(profile);
                return (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    {[
                      {
                        label: "Blood Group",
                        value: <BloodGroupBadge group={profile?.bloodGroup} />,
                      },
                      {
                        label: "NBTC Status",
                        value: (
                          <span
                            className={`badge-jl badge-${nbtc.isEligible ? "success" : "warning"}`}
                          >
                            {nbtc.isEligible ? "Eligible" : `Cooldown (${nbtc.daysRemaining}d)`}
                          </span>
                        ),
                      },
                      { label: "Gender", value: profile?.gender || "MALE" },
                      {
                        label: "NBTC Interval",
                        value: profile?.gender === "FEMALE" ? "120 Days (Female)" : "90 Days (Male)",
                      },
                      {
                        label: "Next Eligible",
                        value: nbtc.isEligible
                          ? "Available Now"
                          : (nbtc.nextEligibleDate ? new Date(nbtc.nextEligibleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "Available Now"),
                      },
                      { label: "City", value: profile?.city || "Not set" },
                      { label: "Donations", value: profile?.donationCount ?? 0 },
                    ].map((r) => (
                      <div
                        key={r.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "6px 0",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            fontWeight: 500,
                          }}
                        >
                          {r.label}
                        </span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="card-jl">
            <div className="card-jl-header">
              <h3>Notifications</h3>
              {unread > 0 && (
                <span className="badge-jl badge-danger">{unread} new</span>
              )}
            </div>
            <div>
              {loading ? (
                <LoadingSpinner />
              ) : notifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No notifications"
                  description="You're all caught up!"
                />
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`notification-card ${!n.isRead ? "unread" : ""}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="notification-card-body">
                      <div className="notification-card-title">{n.title}</div>
                      <div className="notification-card-message">
                        {n.message}
                      </div>
                      <div className="notification-card-time">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Emergency Matches */}
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>Emergency Requests</h3>
            {pending > 0 && (
              <span className="badge-jl badge-emergency">
                {pending} pending
              </span>
            )}
          </div>
          <div className="card-jl-body">
            {loading ? (
              <LoadingSpinner />
            ) : matches.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No emergency requests"
                description="You'll be notified here when a hospital nearby needs your blood type."
              />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {matches.map((m) => (
                  <EmergencyNotifCard
                    key={m.id}
                    match={m}
                    onRespond={handleRespond}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donate / Schedule Appointment Modal */}
      {donateModalOpen && (
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
          onClick={() => setDonateModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
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
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Droplets size={22} style={{ color: "var(--brand-primary)" }} />
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                  Donate Blood — Schedule Appointment
                </h3>
              </div>
              <button
                onClick={() => setDonateModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            {scheduledAppointment ? (
              <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.3rem", fontWeight: 800, color: "#065f46" }}>
                  Appointment Confirmed!
                </h3>
                <p style={{ margin: "0 0 1.5rem", fontSize: "0.95rem", color: "#334155" }}>
                  Your blood donation appointment has been scheduled for:
                </p>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
                    <Calendar size={18} style={{ color: "var(--brand-primary)" }} />
                    {scheduledAppointment.formattedDate}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontSize: "0.9rem" }}>
                    <span>🏥</span>
                    {scheduledAppointment.bankName}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <Link
                    to="/donor/appointments"
                    className="btn-primary-jl"
                    style={{ textDecoration: "none" }}
                    onClick={() => setDonateModalOpen(false)}
                  >
                    View in Appointments
                  </Link>
                  <button
                    className="btn-outline-jl"
                    onClick={() => setDonateModalOpen(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} style={{ padding: "1.5rem" }}>
                {(() => {
                  const nbtc = getNbtcStatus(profile);
                  const isFemale = profile?.gender === "FEMALE";
                  const interval = isFemale ? 120 : 90;
                  const minDate = (!nbtc.isEligible && nbtc.nextEligibleDate)
                    ? new Date(nbtc.nextEligibleDate).toISOString().slice(0, 16)
                    : new Date().toISOString().slice(0, 16);

                  return (
                    <>
                      {!nbtc.isEligible && nbtc.daysRemaining > 0 ? (
                        <div
                          style={{
                            background: "#fffbeb",
                            border: "1.5px solid #fde68a",
                            borderRadius: 8,
                            padding: "10px 14px",
                            marginBottom: 16,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#b45309", fontWeight: 700, fontSize: "0.875rem" }}>
                            <Clock size={16} /> NBTC India Cooldown Active ({nbtc.daysRemaining} days remaining)
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#92400e" }}>
                            Under Indian NBTC guidelines ({interval} days for {isFemale ? "female" : "male"} donors), the earliest appointment you can schedule is{" "}
                            <strong>{nbtc.nextEligibleDate ? new Date(nbtc.nextEligibleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</strong>.
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: 8,
                            padding: "10px 14px",
                            marginBottom: 16,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#166534", fontWeight: 600, fontSize: "0.875rem" }}>
                            <CheckCircle size={16} /> NBTC Eligibility Confirmed ({interval}-Day Interval Satisfied)
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#15803d" }}>
                            You are fully cleared under Indian blood banking standards to donate whole blood.
                          </p>
                        </div>
                      )}

                      <label className="form-label-jl">Select Blood Bank / Center</label>
                      <select
                        className="input-jl"
                        required
                        value={donateForm.bloodBankId}
                        onChange={(e) =>
                          setDonateForm({ ...donateForm, bloodBankId: e.target.value })
                        }
                      >
                        <option value="">Select a blood bank</option>
                        {banks.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.user?.name || "Blood Bank"} ({b.city || "Main Facility"})
                          </option>
                        ))}
                      </select>

                      <label className="form-label-jl" style={{ marginTop: 12 }}>
                        Appointment Date &amp; Time
                      </label>
                      <input
                        type="datetime-local"
                        className="input-jl"
                        required
                        min={minDate}
                        value={donateForm.scheduledAt}
                        onChange={(e) =>
                          setDonateForm({ ...donateForm, scheduledAt: e.target.value })
                        }
                      />
                    </>
                  );
                })()}

                <label className="form-label-jl" style={{ marginTop: 12 }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  className="input-jl"
                  placeholder="e.g. Prefer morning slot"
                  value={donateForm.notes}
                  onChange={(e) =>
                    setDonateForm({ ...donateForm, notes: e.target.value })
                  }
                />

                <div style={{ display: "flex", gap: 10, marginTop: "1.5rem", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn-outline-jl"
                    onClick={() => setDonateModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-jl"
                    disabled={submittingAppointment}
                  >
                    <Calendar size={16} />
                    {submittingAppointment ? "Booking..." : "Confirm Appointment with Date"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .donor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
