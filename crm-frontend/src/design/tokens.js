// Single source of truth for Cirrus colors. Pure data, no imports.
// Brand = evergreen. Amber = accent (fills/charts only, never as text on white).
// Semantic colors stay independent of brand so "won" is never confused with "primary".
// index.css mirrors these values as CSS variables; design.test.mjs fails if they drift.

export const tokens = {
  light: {
    primary: { main: "#0F5F55", dark: "#0A4540", light: "#E3F1EE", contrastText: "#FFFFFF" },
    accent: { main: "#D9A441", dark: "#8A5A00", light: "#FBF1DC", contrastText: "#3B2A06" },
    success: { main: "#2A7430", light: "#E6F2E6", contrastText: "#FFFFFF" },
    warning: { main: "#9A5200", light: "#FBEBD6", contrastText: "#FFFFFF" },
    error: { main: "#B3261E", light: "#FBE7E5", border: "#F3C6C2", contrastText: "#FFFFFF" },
    info: { main: "#1160B7", light: "#E3EEFA", contrastText: "#FFFFFF" },
    background: { default: "#F4F7F9", paper: "#FFFFFF" },
    text: { primary: "#14212B", secondary: "#55646F" },
    divider: "#DDE4E8",
    faint: "#A9B5BD",
    track: "#E3E8EC",
    trackStrong: "#C5D0D6",
    sidebar: { bg: "#0B3F3A", text: "#DCEBE8", textMuted: "#9CC2BC", active: "#14574F" },
  },
  dark: {
    primary: { main: "#4FB3A5", dark: "#2F8F82", light: "#12302C", contrastText: "#06201C" },
    accent: { main: "#E3B35A", dark: "#E3B35A", light: "#3A2D10", contrastText: "#241A04" },
    success: { main: "#6CC070", light: "#16301A", contrastText: "#07200A" },
    warning: { main: "#E8A04A", light: "#3A2810", contrastText: "#241504" },
    error: { main: "#FF8A80", light: "#3A1815", border: "#5C2B27", contrastText: "#2A0806" },
    info: { main: "#4A9EFF", light: "#10253D", contrastText: "#04182E" },
    background: { default: "#0D1514", paper: "#141F1D" },
    text: { primary: "#E8EEEC", secondary: "#9AABA7" },
    divider: "#26332F",
    faint: "#55645F",
    track: "#26332F",
    trackStrong: "#34443F",
    sidebar: { bg: "#08201D", text: "#DCEBE8", textMuted: "#86ADA7", active: "#12403A" },
  },
};

// Mode-independent: mid-tone colors that keep >=4.5:1 against white text/surfaces
// and >=3:1 on the dark surface, so the same static value works in both themes
// (existing code imports these as plain objects and cannot react to mode).
export const stages = {
  prospecting: "#6B7773",
  qualification: "#2C72C4",
  proposal: "#1C7F72",
  negotiation: "#B06010",
  won: "#2E8537",
  lost: "#CC4036",
};

export const leadStatus = {
  new: stages.qualification,
  contacted: stages.proposal,
  qualified: stages.negotiation,
  converted: stages.won,
  disqualified: stages.lost,
};

export function getTokens(mode) {
  return mode === "dark" ? tokens.dark : tokens.light;
}