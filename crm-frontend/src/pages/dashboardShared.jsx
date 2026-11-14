import React from "react";
import { Box, Typography } from "@mui/material";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useThemeMode } from "../context/ThemeModeProvider";
import { stageColors, leadStatusColors, chartChrome, STAT_ACCENTS } from "../design/palette";
import { compactMoney, greetingFor, longDate } from "../utils/dashboardFormat";

// Colors come from src/design/tokens.js (single source of truth, mirrored in index.css).
// STAGE_COLORS / LEAD_STATUS_COLORS are static mid-tone values that stay readable in
// light AND dark mode, so code that imports them as plain objects keeps working.
export const STAGE_COLORS = stageColors();
export const STAGE_LABELS = {
  prospecting: "Prospecting", qualification: "Qualification", proposal: "Proposal",
  negotiation: "Negotiation", won: "Won", lost: "Lost",
};
export const LEAD_STATUS_COLORS = leadStatusColors();
export { STAT_ACCENTS, compactMoney };

// ── Theme-aware chart styles ────────────────────────────────────────
export function useChartStyles() {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const c = chartChrome(mode);
  return {
    tickStyle: { fontSize: 11.5, fontFamily: "IBM Plex Sans", fill: c.tick },
    monoTickStyle: { fontSize: 11.5, fontFamily: "IBM Plex Mono", fill: c.tick },
    tooltipStyle: {
      fontFamily: "IBM Plex Sans", fontSize: 12.5,
      border: `1px solid ${c.tooltipBorder}`,
      borderRadius: 6,
      boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
      backgroundColor: c.tooltipBg,
      color: c.tooltipText,
    },
    gridStroke: c.grid,
    axisStroke: c.axis,
    cursorFill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    gaugeTrack: c.gaugeTrack,
    gaugeFill: c.gaugeFill,
    brandFill: c.brandFill,
    areaGradientColor: c.brandFill,
    forecastWon: c.forecastWon,
    forecastWeighted: c.forecastWeighted,
  };
}

// Backward-compatible static exports (light-mode defaults); prefer useChartStyles().
const lightChrome = chartChrome("light");
export const tickStyle = { fontSize: 11.5, fontFamily: "IBM Plex Sans", fill: lightChrome.tick };
export const monoTickStyle = { ...tickStyle, fontFamily: "IBM Plex Mono" };
export const tooltipStyle = {
  fontFamily: "IBM Plex Sans", fontSize: 12.5, border: `1px solid ${lightChrome.tooltipBorder}`,
  borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

// "Good morning, Amara" + "Friday, October 30"
export function DashboardGreeting({ name }) {
  const now = new Date();
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {greetingFor(now)}{name ? `, ${name}` : ""}
      </Typography>
      <Typography variant="body2" color="text.secondary">{longDate(now)}</Typography>
    </Box>
  );
}

export function WinRateGauge({ pct }) {
  const { mode } = useThemeMode();
  const c = chartChrome(mode);
  const data = [{ name: "win rate", value: pct ?? 0, fill: c.gaugeFill }];
  return (
    <div style={{ position: "relative", height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={180} endAngle={0} barSize={16}>
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: c.gaugeTrack }} domain={[0, 100]} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", paddingTop: 20 }}>
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 600, color: c.tooltipText }}>{pct !== null && pct !== undefined ? `${pct}%` : "—"}</span>
        <span style={{ fontSize: 11, color: c.tick }}>win rate</span>
      </div>
    </div>
  );
}