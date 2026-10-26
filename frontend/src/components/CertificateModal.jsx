import React from "react";
import { Download, Printer, X, Award, CheckCircle } from "lucide-react";
import {
  generateSvgString,
  downloadCertificateSvg,
  printCertificate,
} from "../utils/certificates";

export default function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;

  const svgMarkup = generateSvgString(certificate);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "960px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Award size={24} style={{ color: "var(--brand-primary, #e11d48)" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                {certificate.title || "Certificate of Appreciation"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Official JeevanLink Recognition • ID: {certificate.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: 6,
              display: "flex",
              color: "#64748b",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Certificate Display Area */}
        <div
          style={{
            padding: "1.5rem",
            overflowY: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f1f5f9",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "880px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
              borderRadius: "8px",
              overflow: "hidden",
              lineHeight: 0,
            }}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </div>

        {/* Action Buttons Toolbar */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "#16a34a" }}>
            <CheckCircle size={16} /> Verified Official Digital Certificate
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-outline-jl"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => printCertificate(certificate)}
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
            <button
              className="btn-primary-jl"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => downloadCertificateSvg(certificate)}
            >
              <Download size={16} /> Download SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
