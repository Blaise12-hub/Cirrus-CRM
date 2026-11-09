import { getTokens, stages, leadStatus } from "./tokens.js";

// MUI-compatible palette object: createTheme({ palette: buildPalette(mode) }).
export function buildPalette(mode) {
  const t = getTokens(mode);
  return {
    mode: mode === "dark" ? "dark" : "light",
    primary: t.primary,
    secondary: t.accent,
    success: t.success,
    warning: t.warning,
    error: t.error,
    info: t.info,
    background: t.background,
    text: t.text,
    divider: t.divider,
  };
}

// Same values in both modes by design (see tokens.js). `mode` kept so callers
// can stay mode-aware later without an API change.
export function stageColors() {
  return { ...stages };
}

export function leadStatusColors() {
  return { ...leadStatus };
}

// Chart chrome derived from tokens (replaces hardcoded hexes in the charts file).
export function chartChrome(mode) {
  const t = getTokens(mode);
  return {
    tick: t.text.secondary,
    grid: t.divider,
    axis: t.divider,
    tooltipBg: t.background.paper,
    tooltipText: t.text.primary,
    tooltipBorder: t.divider,
    gaugeTrack: t.track,
    gaugeFill: t.primary.main,
    brandFill: t.primary.main,
    forecastWon: t.success.main,
    forecastWeighted: t.accent.main,
  };
}

// Top-strip gradients for dashboard stat cards, as [from, to]. `from` uses CSS
// variables so it follows light/dark mode; `to` is a fixed lighter shade. They
// feed the --accent-from / --accent-to custom properties read by
// .stat-card-accent in index.css.
export const STAT_ACCENTS = {
  brand: ["var(--color-primary)", "var(--color-accent)"],
  success: ["var(--color-success)", "#8CCB90"],
  danger: ["var(--color-error)", "#F0A8A2"],
  warning: ["var(--color-warning)", "var(--color-accent)"],
  info: ["#2C72C4", "#9CC3EE"],
  neutral: ["var(--color-faint)", "var(--color-track-strong)"],
};