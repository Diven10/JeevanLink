import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  StatCard,
  BloodGroupBadge,
  EmptyState,
  LoadingSpinner,
} from "../components/UI";
import {
  Droplets,
  AlertTriangle,
  PlusCircle,
  FlaskConical,
} from "lucide-react";

const ALL_BLOOD_GROUPS = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O-" },
];

export default function BloodBankDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bloodGroup: "A_POS", units: "" });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(
        "https://jeevanlink-production.up.railway.app/api/blood-banks/inventory",
      );
      setInventory(res.data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(
        "https://jeevanlink-production.up.railway.app/api/blood-banks/inventory",
        {
          bloodGroup: form.bloodGroup,
          units: parseInt(form.units),
        },
      );
      toast.success(
        `Inventory updated for ${form.bloodGroup.replace("_POS", "+").replace("_NEG", "-")}`,
      );
      fetchInventory();
      setForm((p) => ({ ...p, units: "" }));
    } catch {
      toast.error("Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  // Build full inventory with zeros for missing groups
  const inventoryMap = {};
  inventory.forEach((i) => {
    inventoryMap[i.bloodGroup] = i;
  });
  const fullInventory = ALL_BLOOD_GROUPS.map((bg) => ({
    ...bg,
    units: inventoryMap[bg.value]?.units ?? 0,
    updatedAt: inventoryMap[bg.value]?.updatedAt,
  }));

  const totalUnits = fullInventory.reduce((s, i) => s + i.units, 0);
  const lowStock = fullInventory.filter(
    (i) => i.units < 10 && i.units > 0,
  ).length;
  const critical = fullInventory.filter((i) => i.units === 0).length;

  return (
    <DashboardLayout title="Blood Bank Dashboard">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>
          Inventory Management
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          {user?.name} — Real-time blood stock overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        <StatCard
          icon={Droplets}
          label="Total Units"
          value={totalUnits}
          accentColor="#3b82f6"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStock}
          accentColor="#f59e0b"
          change="< 10 units"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical / Empty"
          value={critical}
          accentColor="#ef4444"
        />
        <StatCard
          icon={FlaskConical}
          label="Blood Types"
          value={`${fullInventory.filter((i) => i.units > 0).length}/8`}
          accentColor="#10b981"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "1.5rem",
        }}
      >
        {/* Update Form */}
        <div className="card-jl">
          <div className="card-jl-header">
            <h3>Update Inventory</h3>
          </div>
          <div className="card-jl-body">
            <form onSubmit={handleUpdate}>
              <div className="form-group-jl">
                <label className="form-label-jl">Blood Group</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 6,
                  }}
                >
                  {ALL_BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg.value}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, bloodGroup: bg.value }))
                      }
                      style={{
                        padding: "8px 4px",
                        borderRadius: 6,
                        border: `2px solid ${form.bloodGroup === bg.value ? "var(--brand-primary)" : "var(--border-color)"}`,
                        background:
                          form.bloodGroup === bg.value
                            ? "var(--brand-primary)"
                            : "white",
                        color:
                          form.bloodGroup === bg.value
                            ? "white"
                            : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        transition: "all 0.15s",
                      }}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group-jl">
                <label className="form-label-jl">Total Available Units</label>
                <input
                  className="input-jl"
                  type="number"
                  min="0"
                  max="9999"
                  placeholder="Enter units"
                  value={form.units}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, units: e.target.value }))
                  }
                  required
                />
                <p className="form-hint">
                  This sets the absolute count (not a delta).
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary-jl"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <PlusCircle size={15} />
                {submitting ? "Updating..." : "Update Stock"}
              </button>
            </form>
          </div>
        </div>

        {/* Blood Group Cards Grid */}
        <div>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 12,
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Current Stock by Blood Group
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
              marginBottom: "1.5rem",
            }}
          >
            {fullInventory.map((bg) => (
              <div
                key={bg.value}
                className={`blood-group-card ${bg.units === 0 ? "low-stock" : bg.units < 10 ? "low-stock" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setForm((p) => ({ ...p, bloodGroup: bg.value }))}
              >
                <div className="blood-type">{bg.label}</div>
                <div className="blood-units" style={{ fontSize: "1.5rem" }}>
                  {bg.units}
                </div>
                <div className="blood-label" style={{ marginTop: 4 }}>
                  {bg.units === 0 ? (
                    <span style={{ color: "var(--danger)", fontWeight: 700 }}>
                      ● EMPTY
                    </span>
                  ) : bg.units < 10 ? (
                    <span style={{ color: "var(--warning)", fontWeight: 700 }}>
                      ⚠ LOW
                    </span>
                  ) : (
                    <span style={{ color: "var(--success)" }}>● Available</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Inventory Table */}
          <div className="card-jl">
            <div className="card-jl-header">
              <h3>Inventory Detail</h3>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="table-jl-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Units</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullInventory.map((bg) => (
                      <tr key={bg.value}>
                        <td>
                          <BloodGroupBadge group={bg.value} />
                        </td>
                        <td>
                          <strong>{bg.units}</strong>
                        </td>
                        <td>
                          <span
                            className={`badge-jl ${bg.units === 0 ? "badge-danger" : bg.units < 10 ? "badge-warning" : "badge-success"}`}
                          >
                            {bg.units === 0
                              ? "Empty"
                              : bg.units < 10
                                ? "Low Stock"
                                : "Available"}
                          </span>
                        </td>
                        <td
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {bg.updatedAt
                            ? new Date(bg.updatedAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
