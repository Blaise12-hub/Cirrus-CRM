import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

// Same accent colors OpportunityDetail.jsx uses for its stage buttons.
export const STAGE_COLORS = {
  prospecting: "#8A8D91", qualification: "#5E7CE2", proposal: "#1160B7",
  negotiation: "#B25E09", won: "#2E7D46", lost: "#B3261E",
};
export const STAGE_LABELS = {
  prospecting: "Prospecting", qualification: "Qualification", proposal: "Proposal",
  negotiation: "Negotiation", won: "Won", lost: "Lost",
};
export const LEAD_STATUS_COLORS = {
  new: "#5E7CE2", contacted: "#1160B7", qualified: "#B25E09", converted: "#2E7D46", disqualified: "#B3261E",
};

export const tickStyle = { fontSize: 11.5, fontFamily: "IBM Plex Sans", fill: "#6B6B6B" };
export const monoTickStyle = { ...tickStyle, fontFamily: "IBM Plex Mono" };
export const tooltipStyle = {
  fontFamily: "IBM Plex Sans", fontSize: 12.5, border: "1px solid #D8D8D8",
  borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

export function WinRateGauge({ pct }) {
  const data = [{ name: "win rate", value: pct ?? 0, fill: "#1160B7" }];
  return (
    <div style={{ position: "relative", height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={180} endAngle={0} barSize={16}>
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#EEEEEE" }} domain={[0, 100]} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", paddingTop: 20 }}>
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 600 }}>{pct !== null ? `${pct}%` : "—"}</span>
        <span style={{ fontSize: 11, color: "#6B6B6B" }}>win rate</span>
      </div>
    </div>
  );
}