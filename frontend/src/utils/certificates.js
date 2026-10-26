// Utility for generating, storing, downloading, and printing JeevanLink Appreciation Certificates

export function getCertificates(userEmail) {
  if (!userEmail) return [];
  try {
    const raw = localStorage.getItem(`jl_certs_${userEmail}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading certificates", e);
    return [];
  }
}

export function saveCertificate(userEmail, cert) {
  if (!userEmail || !cert) return;
  try {
    const existing = getCertificates(userEmail);
    // Don't add duplicate certificate ID
    const filtered = existing.filter((c) => c.id !== cert.id);
    const updated = [cert, ...filtered];
    localStorage.setItem(`jl_certs_${userEmail}`, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error saving certificate", e);
    return [];
  }
}

export function generateSvgString(cert) {
  const isOrgan = cert.type === "ORGAN_PLEDGE";
  const primaryColor = isOrgan ? "#047857" : "#e11d48";
  const secondaryColor = isOrgan ? "#065f46" : "#9f1239";
  const themeBadge = isOrgan ? "ORGAN DONOR HERO" : "BLOOD DONOR HERO";
  const themeTitle = isOrgan
    ? "ORGAN DONATION PLEDGE OF HONOR"
    : "VOLUNTARY BLOOD DONATION HONOR";
  const mainIcon = isOrgan ? "🫀" : "🩸";

  const dateStr = cert.date
    ? new Date(cert.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1056 748" width="1056" height="748" style="background:#ffffff; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <defs>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#fffdfa" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>
    <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect x="0" y="0" width="1056" height="748" fill="url(#bgGrad)" />

  <!-- Outer Elegant Frame -->
  <rect x="24" y="24" width="1008" height="700" fill="none" stroke="url(#borderGrad)" stroke-width="7" rx="12" />
  <rect x="36" y="36" width="984" height="676" fill="none" stroke="url(#goldGrad)" stroke-width="2" rx="8" />
  <rect x="46" y="46" width="964" height="656" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4" />

  <!-- Corner Accents -->
  <path d="M 46 80 L 46 46 L 80 46" fill="none" stroke="${primaryColor}" stroke-width="4" />
  <path d="M 1010 80 L 1010 46 L 976 46" fill="none" stroke="${primaryColor}" stroke-width="4" />
  <path d="M 46 668 L 46 702 L 80 702" fill="none" stroke="${primaryColor}" stroke-width="4" />
  <path d="M 1010 668 L 1010 702 L 976 702" fill="none" stroke="${primaryColor}" stroke-width="4" />

  <!-- Center Subtle Watermark Emblem -->
  <g opacity="0.04" transform="translate(528, 374)">
    <circle r="190" fill="${primaryColor}" />
    <text text-anchor="middle" dominant-baseline="central" font-size="200">${mainIcon}</text>
  </g>

  <!-- Top Header Crest -->
  <g transform="translate(528, 88)">
    <circle cx="0" cy="0" r="28" fill="${primaryColor}" />
    <text x="0" y="7" text-anchor="middle" font-size="26" fill="#ffffff">${mainIcon}</text>
    <text x="0" y="44" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="3" fill="#64748b">JEEVANLINK HEALTH NETWORK</text>
  </g>

  <!-- Title Section -->
  <text x="528" y="172" text-anchor="middle" font-size="34" font-weight="900" letter-spacing="2" fill="${secondaryColor}">CERTIFICATE OF APPRECIATION</text>
  <text x="528" y="200" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="4" fill="#b45309">${themeTitle}</text>

  <!-- Divider Line -->
  <line x1="388" y1="216" x2="668" y2="216" stroke="url(#goldGrad)" stroke-width="2" />
  <polygon points="528,212 534,216 528,220 522,216" fill="#d97706" />

  <!-- Recipient Presentation -->
  <text x="528" y="254" text-anchor="middle" font-size="15" font-style="italic" fill="#64748b">This certificate is proudly awarded to</text>
  
  <text x="528" y="310" text-anchor="middle" font-size="36" font-weight="800" fill="#0f172a" text-decoration="underline">${cert.recipientName || "Valued Lifesaver"}</text>

  <!-- Recognition Narrative -->
  <text x="528" y="356" text-anchor="middle" font-size="16" fill="#334155" max-width="800">
    ${
      isOrgan
        ? "In heartfelt recognition of your noble decision to register as a voluntary organ donor."
        : "In profound gratitude for your selfless voluntary blood donation that saved lives."
    }
  </text>
  <text x="528" y="382" text-anchor="middle" font-size="15" fill="#475569">
    ${cert.details || "Your kindness and altruism bring life, hope, and healing to our community."}
  </text>

  <!-- Badges / Metadata Cards -->
  <g transform="translate(528, 436)">
    <!-- Blood Group / Category Badge -->
    <rect x="-240" y="0" width="140" height="52" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5" />
    <text x="-170" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="#64748b">BLOOD GROUP</text>
    <text x="-170" y="40" text-anchor="middle" font-size="16" font-weight="800" fill="${primaryColor}">${cert.bloodGroup || "O+"}</text>

    <!-- Theme Tag -->
    <rect x="-80" y="0" width="160" height="52" rx="8" fill="#fef3c7" stroke="#fde68a" stroke-width="1.5" />
    <text x="0" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="#92400e">CATEGORY</text>
    <text x="0" y="40" text-anchor="middle" font-size="13" font-weight="800" fill="#b45309">${themeBadge}</text>

    <!-- Date of Issue -->
    <rect x="100" y="0" width="140" height="52" rx="8" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5" />
    <text x="170" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="#64748b">DATE ISSUED</text>
    <text x="170" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">${dateStr}</text>
  </g>

  <!-- Signatures and Official Gold Seal -->
  <g transform="translate(0, 560)">
    <!-- Left Authority Signature -->
    <g transform="translate(160, 0)">
      <path d="M 0 35 Q 35 15 70 30 T 140 25 T 190 35" fill="none" stroke="#1e293b" stroke-width="2.5" />
      <line x1="0" y1="50" x2="210" y2="50" stroke="#94a3b8" stroke-width="1.5" />
      <text x="105" y="72" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">Dr. Rajesh V. Sharma</text>
      <text x="105" y="90" text-anchor="middle" font-size="12" fill="#64748b">Director of Medical Services</text>
    </g>

    <!-- Center Golden Embossed Seal -->
    <g transform="translate(528, 30)" filter="url(#sealShadow)">
      <circle r="44" fill="url(#goldGrad)" stroke="#78350f" stroke-width="2" />
      <circle r="36" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,2" />
      <text x="0" y="-12" text-anchor="middle" font-size="9" font-weight="800" fill="#ffffff" letter-spacing="1">JEEVANLINK</text>
      <text x="0" y="6" text-anchor="middle" font-size="18">★ ★ ★</text>
      <text x="0" y="22" text-anchor="middle" font-size="9" font-weight="800" fill="#ffffff" letter-spacing="1">VERIFIED</text>
    </g>

    <!-- Right Authority Signature -->
    <g transform="translate(686, 0)">
      <path d="M 0 28 Q 40 40 80 20 T 150 35 T 200 28" fill="none" stroke="#1e293b" stroke-width="2.5" />
      <line x1="0" y1="50" x2="210" y2="50" stroke="#94a3b8" stroke-width="1.5" />
      <text x="105" y="72" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">National Transfusion Registry</text>
      <text x="105" y="90" text-anchor="middle" font-size="12" fill="#64748b">Governing Council, JeevanLink</text>
    </g>
  </g>

  <!-- Bottom Verification Footer -->
  <text x="528" y="682" text-anchor="middle" font-size="11" font-family="monospace" fill="#94a3b8">Certificate ID: ${cert.id || "JL-CERT-2026"} • Authentic Digital Record • Verified by JeevanLink Network</text>
</svg>`;
}

export function downloadCertificateSvg(cert) {
  const svgContent = generateSvgString(cert);
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `JeevanLink_Certificate_${cert.id || "Appreciation"}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printCertificate(cert) {
  const svgContent = generateSvgString(cert);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print or save the certificate as PDF.");
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Certificate - ${cert.recipientName || "JeevanLink"}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8fafc;
          }
          .certificate-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            max-width: 100%;
            max-height: 100%;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          @media print {
            body {
              background: none;
            }
            .certificate-container {
              width: 100vw;
              height: 100vh;
            }
            svg {
              width: 100%;
              height: 100%;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          ${svgContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
