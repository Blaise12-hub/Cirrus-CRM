import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useThemeMode } from "../context/ThemeModeProvider";

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

// ── Theme-aware chart styles ────────────────────────────────────────
// Exported as functions so they pick up the current mode at call time.
// Components that use useThemeMode() can pass mode, or call the helpers.

const LIGHT_TICK_FILL = "#6B6B6B";
const DARK_TICK_FILL = "#9498A3";

export function useChartStyles() {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  return {
    tickStyle: { fontSize: 11.5, fontFamily: "IBM Plex Sans", fill: isDark ? DARK_TICK_FILL : LIGHT_TICK_FILL },
    monoTickStyle: { fontSize: 11.5, fontFamily: "IBM Plex Mono", fill: isDark ? DARK_TICK_FILL : LIGHT_TICK_FILL },
    tooltipStyle: {
      fontFamily: "IBM Plex Sans", fontSize: 12.5,
      border: `1px solid ${isDark ? "#2E323D" : "#D8D8D8"}`,
      borderRadius: 6,
      boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
      backgroundColor: isDark ? "#1D2029" : "#FFFFFF",
      color: isDark ? "#EDEDEF" : "#1A1A1A",
    },
    gridStroke: isDark ? "#2A2D37" : "#EEEEEE",
    axisStroke: isDark ? "#2E323D" : "#D8D8D8",
    cursorFill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    gaugeTrack: isDark ? "#2A2D37" : "#EEEEEE",
    gaugeFill: isDark ? "#4A9EFF" : "#1160B7",
    areaGradientColor: isDark ? "#4A9EFF" : "#1160B7",
  };
}

// Backward-compatible named exports (light-mode defaults) so existing code
// that doesn't call the hook still compiles — but prefer useChartStyles().
export const tickStyle = { fontSize: 11.5, fontFamily: "IBM Plex Sans", fill: LIGHT_TICK_FILL };
export const monoTickStyle = { ...tickStyle, fontFamily: "IBM Plex Mono" };
export const tooltipStyle = {
  fontFamily: "IBM Plex Sans", fontSize: 12.5, border: "1px solid #D8D8D8",
  borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

export function WinRateGauge({ pct }) {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const gaugeFill = isDark ? "#4A9EFF" : "#1160B7";
  const gaugeTrack = isDark ? "#2A2D37" : "#EEEEEE";
  const textColor = isDark ? "#EDEDEF" : undefined;
  const subColor = isDark ? "#9498A3" : "#6B6B6B";

  const data = [{ name: "win rate", value: pct ?? 0, fill: gaugeFill }];
  return (
    <div style={{ position: "relative", height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={180} endAngle={0} barSize={16}>
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: gaugeTrack }} domain={[0, 100]} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", paddingTop: 20 }}>
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 600, color: textColor }}>{pct !== null ? `${pct}%` : "—"}</span>
        <span style={{ fontSize: 11, color: subColor }}>win rate</span>
      </div>
    </div>
  );
}