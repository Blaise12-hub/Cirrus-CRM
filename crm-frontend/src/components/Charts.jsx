import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useThemeMode } from "../context/ThemeModeProvider";
import { stageColors, leadStatusColors, chartChrome } from "../design/palette";

// Colors come from src/design/tokens.js (single source of truth).
// These are static, mid-tone values that stay readable in light AND dark mode,
// so existing code that imports them as plain objects keeps working.
export const STAGE_COLORS = stageColors();
export const STAGE_LABELS = {
  prospecting: "Prospecting", qualification: "Qualification", proposal: "Proposal",
  negotiation: "Negotiation", won: "Won", lost: "Lost",
};
export const LEAD_STATUS_COLORS = leadStatusColors();

// ── Theme-aware chart styles ────────────────────────────────────────
// Exported as functions so they pick up the current mode at call time.
// Components that use useThemeMode() can pass mode, or call the helpers.

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
    areaGradientColor: c.gaugeFill,
    forecastWon: c.forecastWon,
    forecastWeighted: c.forecastWeighted,
  };
}

// Backward-compatible named exports (light-mode defaults) so existing code
// that doesn't call the hook still compiles — but prefer useChartStyles().
const lightChrome = chartChrome("light");
export const tickStyle = { fontSize: 11.5, fontFamily: "IBM Plex Sans", fill: lightChrome.tick };
export const monoTickStyle = { ...tickStyle, fontFamily: "IBM Plex Mono" };
export const tooltipStyle = {
  fontFamily: "IBM Plex Sans", fontSize: 12.5, border: `1px solid ${lightChrome.tooltipBorder}`,
  borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

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
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 600, color: c.tooltipText }}>{pct !== null ? `${pct}%` : "—"}</span>
        <span style={{ fontSize: 11, color: c.tick }}>win rate</span>
      </div>
    </div>
  );
}