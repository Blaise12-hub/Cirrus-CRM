import React from "react";

export const OWNER_COLORS = { EN: "#0B5CAB", DM: "#2E7D46", AU: "#8A3FFC" };

export function Avatar({ code, size = 26 }) {
  if (!code) return null;
  return (
    <span
      className="avatar"
      style={{ background: OWNER_COLORS[code] || "#6B6B6B", width: size, height: size, fontSize: size * 0.4 }}
      title={code}
    >
      {code}
    </span>
  );
}

export function ProbabilityMeter({ value }) {
  const filled = Math.round((value || 0) / 20);
  return (
    <div className="prob-meter">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`prob-seg ${i < filled ? "filled" : ""}`} />
      ))}
      <span className="prob-num">{value}%</span>
    </div>
  );
}

const STAGE_ACCENTS = {
  prospecting: "#8A8D91",
  qualification: "#5E7CE2",
  proposal: "#0B5CAB",
  negotiation: "#B25E09",
  won: "#2E7D46",
  lost: "#B3261E",
};

export function StagePill({ stage }) {
  const accent = STAGE_ACCENTS[stage] || "#6B6B6B";
  return (
    <span className="stage-pill" style={{ background: `${accent}1A`, color: accent }}>
      {stage}
    </span>
  );
}

const LEAD_STATUS_COLORS = {
  new: "#5E7CE2", contacted: "#B25E09", qualified: "#2E7D46",
  converted: "#0B5CAB", disqualified: "#B3261E",
};

export function LeadStatusPill({ status }) {
  const c = LEAD_STATUS_COLORS[status] || "#6B6B6B";
  return <span className="stage-pill" style={{ background: `${c}1A`, color: c }}>{status}</span>;
}
