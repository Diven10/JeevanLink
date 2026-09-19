import { useEffect, useState } from "react";
import axios from "axios";
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
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import {
  StatCard,
  StatusBadge,
  BloodGroupBadge,
  EmptyState,
  LoadingSpinner,
  PageHeader,
} from "../components/UI";

const API = "https://jeevanlink-production.up.railway.app";
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
            <label className="form-label-jl">Address</label>
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
  return (
    <DashboardLayout
      title="Eligibility"
      subtitle="Your current donation readiness."
    >
      <div className="eligibility-hero">
        <div className="eligibility-icon">
          <Heart size={30} />
        </div>
        <div>
          <div className="section-label">Current status</div>
          <h1>
            <StatusBadge status={d?.eligibility || "ELIGIBLE"} />
          </h1>
          <p>
            Eligibility is a system classification and should be confirmed by
            qualified medical personnel before donation.
          </p>
        </div>
      </div>
      <div className="grid-3">
        <StatCard
          icon={User}
          label="Blood Group"
          value={groupLabel(d?.bloodGroup)}
        />
        <StatCard
          icon={Droplets}
          label="Total Donations"
          value={d?.donationCount || 0}
        />
        <StatCard
          icon={Clock}
          label="Last Donation"
          value={
            d?.lastDonation
              ? new Date(d.lastDonation).toLocaleDateString()
              : "—"
          }
        />
      </div>
      <div className="card-jl" style={{ marginTop: 20 }}>
        <div className="card-jl-body">
          <h3>Eligibility information</h3>
          <p className="muted">
            The project SRS identifies age, weight, hemoglobin, last donation
            date and declared medical conditions as inputs. Exact thresholds are
            configurable/TBD and are not medical advice.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function DonorDonations() {
  const [d, setD] = useState(null);
  useEffect(() => {
    api("/api/donors/me")
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);
  return (
    <DashboardLayout
      title="Donation History"
      subtitle="A chronological record of your contributions."
    >
      <div className="grid-3">
        <StatCard
          icon={Droplets}
          label="Total Donations"
          value={d?.donationCount || 0}
        />
        <StatCard
          icon={Heart}
          label="Units Recorded"
          value={(d?.donations || []).reduce((a, x) => a + (x.units || 0), 0)}
        />
        <StatCard icon={CheckCircle} label="Status" value="Verified records" />
      </div>
      <div className="card-jl" style={{ marginTop: 20 }}>
        <div className="card-jl-header">
          <h3>Recent donations</h3>
        </div>
        {!d?.donations?.length ? (
          <EmptyState
            icon={Droplets}
            title="No donations recorded"
            description="Completed donations will appear here."
          />
        ) : (
          <div className="table-jl-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Units</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {d.donations.map((x) => (
                  <tr key={x.id}>
                    <td>{new Date(x.date).toLocaleDateString()}</td>
                    <td>{x.units}</td>
                    <td>{x.location || "—"}</td>
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

export function DonorAppointments() {
  const [items, setItems] = useState([]),
    [banks, setBanks] = useState([]),
    [form, setForm] = useState({ bloodBankId: "", scheduledAt: "" });
  const load = () =>
    api("/api/donors/appointments")
      .then((r) => setItems(r.data))
      .catch(() => {});
  useEffect(() => {
    load();
    api("/api/blood-banks")
      .then((r) => setBanks(r.data))
      .catch(() => {});
  }, []);
  const book = async (e) => {
    e.preventDefault();
    try {
      await api("/api/donors/appointments", { method: "POST", data: form });
      toast.success("Appointment booked");
      setForm({ bloodBankId: "", scheduledAt: "" });
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
  return (
    <DashboardLayout
      title="Appointments"
      subtitle="Book, review or cancel a donation appointment."
    >
      <div className="jl-two-col">
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>
              <Calendar size={18} /> Book appointment
            </h3>
          </div>
          <form className="card-jl-body" onSubmit={book}>
            <label className="form-label-jl">Blood Bank</label>
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
                  {b.user?.name || "Blood Bank"} — {b.city || ""}
                </option>
              ))}
            </select>
            <label className="form-label-jl">Date & time</label>
            <input
              className="input-jl"
              required
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
            />
            <button className="btn-primary-jl" style={{ marginTop: 16 }}>
              Confirm appointment
            </button>
          </form>
        </div>
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>Upcoming & recent</h3>
          </div>
          <div className="card-jl-body">
            {!items.length ? (
              <EmptyState icon={Calendar} title="No appointments" />
            ) : (
              items.map((a) => (
                <div className="list-row" key={a.id}>
                  <div>
                    <strong>{a.bloodBank?.user?.name || "Blood Bank"}</strong>
                    <div className="muted">
                      {new Date(a.scheduledAt).toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <StatusBadge status={a.status} />
                    {a.status === "BOOKED" && (
                      <button
                        className="btn-danger-jl"
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
  const [form, setForm] = useState({
      bloodGroup: "O_POS",
      organs: [],
      medicalHistory: "",
      emergencyContact: "",
      consent: false,
    }),
    [existing, setExisting] = useState(null);
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
      .then((r) => setExisting(r.data))
      .catch(() => {});
  }, []);
  const toggle = (o) =>
    setForm({
      ...form,
      organs: form.organs.includes(o)
        ? form.organs.filter((x) => x !== o)
        : [...form.organs, o],
    });
  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent)
      return toast.error("Please provide explicit digital consent");
    try {
      const r = await api("/api/organ-donation/register", {
        method: "POST",
        data: { ...form, organs: form.organs.join(",") },
      });
      setExisting(r.data.organDonor);
      toast.success("Organ donor registration saved");
    } catch (e) {
      toast.error(e.response?.data?.error || "Registration failed");
    }
  };
  return (
    <DashboardLayout
      title="Organ Donation"
      subtitle="Voluntary pledge with explicit consent."
    >
      <div className="organ-hero">
        <div>
          <div className="section-label">Give someone another tomorrow</div>
          <h1>Your pledge can help save a life.</h1>
          <p>
            JeevanLink records your voluntary organ donation consent and
            surfaces potential matches for authorized review.
          </p>
        </div>
        <Heart size={70} />
      </div>
      <div className="card-jl form-card">
        <div className="card-jl-header">
          <h3>Organ pledge</h3>
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
              <label className="form-label-jl">Medical history</label>
              <textarea
                className="input-jl"
                value={form.medicalHistory}
                onChange={(e) =>
                  setForm({ ...form, medicalHistory: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label-jl">Emergency contact</label>
              <input
                className="input-jl"
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
          <button className="btn-primary-jl">Save pledge</button>
        </form>
      </div>
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
      "Can anyone donate blood?",
      "Eligibility is evaluated using the project eligibility checker and must be confirmed by qualified medical personnel.",
    ],
    [
      "How does emergency matching work?",
      "A hospital emergency request triggers compatibility-based matching and in-app notifications to potential donors and blood banks.",
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
