import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API } from "../config/api";
import DashboardLayout from "../components/DashboardLayout";
import CertificateModal from "../components/CertificateModal";
import {
  getCertificates,
  saveCertificate,
  downloadCertificateSvg,
  printCertificate,
  generateSvgString,
} from "../utils/certificates";
import {
  StatCard,
  EmptyState,
  LoadingSpinner,
} from "../components/UI";
import {
  Award,
  Download,
  Printer,
  Heart,
  Droplets,
  Calendar,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function DonorCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    syncAndLoadCertificates();
  }, [user]);

  const syncAndLoadCertificates = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      let currentCerts = getCertificates(user.email);

      // Fetch donor profile to sync any existing donations
      try {
        const donorRes = await axios.get(`${API}/api/donors/me`);
        const donorData = donorRes.data;
        const donations = donorData?.donations || [];

        // Check if existing donations need certificates created
        donations.forEach((d) => {
          const certId = `JL-BLD-${d.id.slice(0, 8).toUpperCase()}`;
          const alreadyExists = currentCerts.some((c) => c.id === certId);
          if (!alreadyExists) {
            const newCert = {
              id: certId,
              type: "BLOOD_DONATION",
              title: "Certificate of Appreciation",
              subtitle: "Voluntary Blood Donation Honor",
              recipientName: user.name || "Life Saver",
              bloodGroup: donorData.bloodGroup?.replace("_POS", "+").replace("_NEG", "-") || "O+",
              details: `${d.units || 1} Unit(s) of whole blood donated at ${d.location || "Central Blood Bank"}.`,
              date: d.date || new Date().toISOString(),
              issuedBy: "JeevanLink National Blood Transfusion Network",
            };
            currentCerts = saveCertificate(user.email, newCert);
          }
        });
      } catch (err) {
        // Fallback gracefully if donor API is quiet
      }

      // Fetch organ donation pledge to sync organ pledge certificate
      try {
        const organRes = await axios.get(`${API}/api/organ-donation/me`);
        if (organRes.data) {
          const pledge = organRes.data;
          const certId = `JL-ORG-${pledge.id?.slice(0, 8).toUpperCase() || "PLEDGE"}`;
          const alreadyExists = currentCerts.some((c) => c.id === certId || c.type === "ORGAN_PLEDGE");
          if (!alreadyExists) {
            const organList = pledge.organs ? pledge.organs.replace(/,/g, ", ") : "All eligible organs";
            const newCert = {
              id: certId,
              type: "ORGAN_PLEDGE",
              title: "Certificate of Appreciation",
              subtitle: "Voluntary Organ Donor Pledge of Honor",
              recipientName: user.name || "Life Saver",
              bloodGroup: pledge.bloodGroup?.replace("_POS", "+").replace("_NEG", "-") || "O+",
              details: `Pledged organs for life-saving transplantation: ${organList}.`,
              date: pledge.createdAt || new Date().toISOString(),
              issuedBy: "JeevanLink National Organ & Tissue Donation Registry",
            };
            currentCerts = saveCertificate(user.email, newCert);
          }
        }
      } catch (err) {
        // Fallback gracefully
      }

      setCertificates(currentCerts);
    } finally {
      setLoading(false);
    }
  };

  const bloodCertsCount = certificates.filter((c) => c.type === "BLOOD_DONATION").length;
  const organCertsCount = certificates.filter((c) => c.type === "ORGAN_PLEDGE").length;

  return (
    <DashboardLayout
      title="Appreciation Certificates"
      subtitle="Honoring your selfless commitment to saving lives."
    >
      {/* Stats Summary */}
      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <StatCard
          icon={Award}
          label="Total Certificates"
          value={certificates.length}
          accentColor="#e11d48"
        />
        <StatCard
          icon={Droplets}
          label="Blood Donation Honors"
          value={bloodCertsCount}
          accentColor="#3b82f6"
        />
        <StatCard
          icon={Heart}
          label="Organ Pledge Hero"
          value={organCertsCount > 0 ? "✓ Pledged" : "Not yet"}
          accentColor={organCertsCount > 0 ? "#10b981" : "#64748b"}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : certificates.length === 0 ? (
        <div className="card-jl" style={{ padding: "2.5rem 1.5rem" }}>
          <EmptyState
            icon={Award}
            title="No Certificates Earned Yet"
            description="You will automatically receive official certificates of appreciation whenever you record a blood donation or complete your voluntary organ donation pledge."
            action={
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
                <Link to="/donor/donations" className="btn-primary-jl" style={{ textDecoration: "none" }}>
                  <Droplets size={16} /> Record Blood Donation
                </Link>
                <Link to="/donor/organ-donation" className="btn-outline-jl" style={{ textDecoration: "none" }}>
                  <Heart size={16} /> Pledge Organ Donation
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {certificates.map((cert) => {
              const isOrgan = cert.type === "ORGAN_PLEDGE";
              return (
                <div
                  key={cert.id}
                  className="card-jl"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderTop: `4px solid ${isOrgan ? "#059669" : "#e11d48"}`,
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  <div className="card-jl-body">
                    {/* Badge & Date Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1rem",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: isOrgan ? "#ecfdf5" : "#fff1f2",
                          color: isOrgan ? "#047857" : "#be123c",
                        }}
                      >
                        {isOrgan ? <Heart size={14} /> : <Droplets size={14} />}
                        {isOrgan ? "ORGAN DONOR HERO" : "BLOOD DONOR HERO"}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {new Date(cert.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: 700 }}>
                      {cert.title}
                    </h4>
                    <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#64748b" }}>
                      {cert.subtitle}
                    </p>

                    <div
                      style={{
                        padding: "10px 12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        fontSize: "0.825rem",
                        color: "#334155",
                        marginBottom: "1rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {cert.details}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
                      <span>ID: {cert.id}</span>
                      <span>{cert.bloodGroup ? `Group: ${cert.bloodGroup}` : ""}</span>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div
                    style={{
                      padding: "0.875rem 1.25rem",
                      borderTop: "1px solid var(--border-color)",
                      background: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <button
                      className="btn-primary-jl"
                      style={{ fontSize: "0.825rem", padding: "6px 14px", flex: 1, justifyContent: "center" }}
                      onClick={() => setSelectedCert(cert)}
                    >
                      <Award size={15} /> View Certificate
                    </button>
                    <button
                      className="btn-outline-jl"
                      title="Download SVG"
                      style={{ padding: "6px 10px" }}
                      onClick={() => downloadCertificateSvg(cert)}
                    >
                      <Download size={15} />
                    </button>
                    <button
                      className="btn-outline-jl"
                      title="Print / Save PDF"
                      style={{ padding: "6px 10px" }}
                      onClick={() => printCertificate(cert)}
                    >
                      <Printer size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </DashboardLayout>
  );
}
