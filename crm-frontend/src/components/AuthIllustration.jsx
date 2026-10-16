import React from "react";

export default function AuthIllustration({ brandTitle = "CIRRUS CRM" }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "28px 36px 0" }}>
        <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 32L20 8L28 32H22L20 18L18 32H12Z" fill="#0C7792" />
          <path d="M8 32L17 12L21 22L15 32H8Z" fill="#1496B6" opacity="0.8" />
          <path d="M22 24L26 32H33L25 15L22 24Z" fill="#2CB5D8" opacity="0.9" />
          <circle cx="20" cy="9" r="2.5" fill="#0C7792" />
        </svg>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 2, color: "#0C5A75", fontFamily: "inherit" }}>
          {brandTitle}
        </span>
      </div>

      {/* Main Vector Scene matching Image 1 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 28px 28px" }}>
        <svg
          viewBox="0 0 560 460"
          style={{ width: "100%", maxHeight: "420px", overflow: "visible" }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Background window & architecture */}
          <rect x="70" y="40" width="340" height="280" rx="4" stroke="#DDE5EC" strokeWidth="2" strokeDasharray="3 3" fill="#F8FAFC" opacity="0.6" />
          <line x1="170" y1="40" x2="170" y2="320" stroke="#E2E8F0" strokeWidth="2" />
          <line x1="270" y1="40" x2="270" y2="320" stroke="#E2E8F0" strokeWidth="2" />

          {/* Wall Clock */}
          <circle cx="270" cy="85" r="16" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="270" y1="85" x2="270" y2="76" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="270" y1="85" x2="278" y2="85" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

          {/* City / Building Skyline in background window */}
          <path d="M80 320V230H100V250H120V210H145V320" stroke="#E2E8F0" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M180 320V240H200V220H225V320" stroke="#E2E8F0" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M280 320V220H305V200H325V320" stroke="#E2E8F0" strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* Floating Sign-in Dialog Panel behind the desk (as in prototype Image 1) */}
          <g filter="drop-shadow(0 12px 24px rgba(12,90,117,0.12))">
            <rect x="200" y="125" width="180" height="135" rx="6" fill="#93B4C4" fillOpacity="0.8" />
            <rect x="200" y="125" width="180" height="26" rx="6" fill="#7E9EB0" fillOpacity="0.85" />
            <text x="290" y="142" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="600" opacity="0.95">Sign In</text>
            <rect x="222" y="163" width="136" height="19" rx="3" fill="#FFFFFF" opacity="0.95" />
            <rect x="222" y="188" width="136" height="19" rx="3" fill="#FFFFFF" opacity="0.95" />
            <line x1="230" y1="172" x2="265" y2="172" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <line x1="230" y1="197" x2="255" y2="197" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            {/* Small eye icon representation */}
            <circle cx="346" cy="197" r="3" stroke="#94A3B8" strokeWidth="1" />
            {/* Blue submit button */}
            <rect x="245" y="218" width="90" height="17" rx="3" fill="#0C5A75" />
            <text x="290" y="230" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700">Login</text>
          </g>

          {/* Speech / Notification Bubble */}
          <g transform="translate(132, 125)">
            <rect x="0" y="0" width="46" height="46" rx="12" fill="#B4D3E2" />
            <circle cx="23" cy="23" r="14" fill="#0C5A75" />
            <path d="M23 46L27 54L33 46H23Z" fill="#B4D3E2" />
          </g>

          {/* Wastepaper bin with lattice mesh pattern */}
          <g transform="translate(245, 290)">
            <path d="M5 10L10 65H42L47 10H5Z" fill="#E2EDF3" stroke="#0B698B" strokeWidth="1.5" />
            <path d="M12 10L16 65M22 10L24 65M30 10L28 65M38 10L36 65" stroke="#0B698B" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
            <path d="M7 25L45 25M9 42L43 42" stroke="#0B698B" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
          </g>

          {/* Plant pot with Cactus */}
          <g transform="translate(340, 260)">
            {/* Planter */}
            <path d="M15 65L20 95H55L60 65H15Z" fill="#2D3748" />
            {/* Cactus stems */}
            <rect x="30" y="20" width="16" height="50" rx="8" fill="#14829B" />
            <path d="M26 38H18C14.7 38 12 40.7 12 44V49C12 52.3 14.7 55 18 55H28" stroke="#14829B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M48 32H54C57.3 32 60 34.7 60 38V42C60 45.3 57.3 48 54 48H46" stroke="#14829B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Cactus flowers/accents */}
            <circle cx="38" cy="19" r="4" fill="#E59838" />
            <circle cx="15" cy="42" r="3" fill="#E59838" />
            <circle cx="58" cy="36" r="3" fill="#E59838" />
          </g>

          {/* Modern Workstation Desk */}
          <g>
            {/* Desk Surface */}
            <rect x="85" y="235" width="195" height="12" rx="2" fill="#0C5A75" />
            {/* Desktop Mat */}
            <rect x="110" y="231" width="135" height="4" rx="1" fill="#2087A6" />
            {/* Desk Legs (dark metal frame) */}
            <rect x="94" y="247" width="8" height="95" fill="#2D3748" />
            <rect x="190" y="247" width="8" height="95" fill="#2D3748" />
            <rect x="80" y="338" width="125" height="6" rx="2" fill="#2D3748" />

            {/* Computer Monitor */}
            <rect x="162" y="172" width="62" height="44" rx="3" fill="#64748B" />
            <rect x="165" y="175" width="56" height="38" rx="2" fill="#E2E8F0" />
            <line x1="170" y1="184" x2="200" y2="184" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="170" y1="192" x2="212" y2="192" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="170" y1="200" x2="190" y2="200" stroke="#0C7792" strokeWidth="2" strokeLinecap="round" />
            {/* Monitor Stand */}
            <rect x="189" y="216" width="8" height="19" fill="#94A3B8" />
            <path d="M182 235H204" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            {/* Keyboard */}
            <rect x="160" y="233" width="35" height="3" rx="1" fill="#94A3B8" />
          </g>

          {/* Modern Yellow Office Chair */}
          <g>
            {/* Chair Backrest & Seat */}
            <rect x="74" y="210" width="30" height="45" rx="5" fill="#E5A93B" />
            <path d="M70 248H122C125 248 127 251 126 254L123 260C122 263 119 265 116 265H76C72 265 69 261 70 257L70 248Z" fill="#E5A93B" />
            {/* Chair stem & wheels */}
            <rect x="99" y="265" width="7" height="65" fill="#2D3748" />
            <line x1="75" y1="330" x2="128" y2="330" stroke="#2D3748" strokeWidth="4" strokeLinecap="round" />
            <circle cx="78" cy="334" r="3.5" fill="#1E293B" />
            <circle cx="125" cy="334" r="3.5" fill="#1E293B" />
          </g>

          {/* Person seated at desk */}
          <g>
            {/* Head & Hair */}
            <circle cx="125" cy="154" r="14" fill="#F8C8B0" />
            {/* Dark Hair */}
            <path d="M112 150C112 142 118 135 128 135C136 135 141 140 141 147C137 146 133 148 130 152C127 150 120 151 118 155L112 150Z" fill="#1E293B" />
            {/* Face profile details */}
            <path d="M136 153H139L137 157H134" stroke="#E29D80" strokeWidth="1" strokeLinecap="round" />
            {/* Torso / Shirt */}
            <path d="M110 178C110 172 116 168 122 168H132C138 168 144 172 144 178L148 238H106L110 178Z" fill="#2D3748" />
            {/* White Collar / Tie */}
            <path d="M125 168L127 182L129 168" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Arms extending forward to keyboard */}
            <path d="M120 185L150 215L168 226" stroke="#2D3748" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="170" cy="226" r="4" fill="#F8C8B0" />
            {/* Legs (in blue pants) */}
            <path d="M115 255L170 270L198 335" stroke="#3B82A6" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M106 255L150 275L180 338" stroke="#2B6B8A" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
            {/* Shoes */}
            <ellipse cx="206" cy="340" rx="9" ry="5" fill="#1E293B" />
            <ellipse cx="188" cy="342" rx="9" ry="5" fill="#1E293B" />
          </g>

          {/* Floor Shadow base */}
          <ellipse cx="230" cy="355" rx="190" ry="8" fill="#E2E8F0" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
