import { createTheme, alpha } from "@mui/material/styles";
import { buildPalette } from "./design/palette";
import { getTokens } from "./design/tokens";

// Colors come from src/design/tokens.js (single source of truth, mirrored in
// index.css). If this file lives at src/theme/index.js instead of src/theme.js,
// change the two imports above to "../design/...".
// Brand = evergreen. Amber is the accent: use `accent.main` for fills and
// `accent.dark` for any text that sits on white.

const shared = {
  typography: {
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, fontSize: 12.5, padding: "7px 13px" },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small", fullWidth: true, variant: "outlined" },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" }, // MUI adds a tonal overlay in dark mode by default — flat surfaces instead, matching the existing card look
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 8,
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 8 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: 11.5 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 },
        root: { fontSize: 13 },
      },
    },
    // Standard alerts: tinted background + body-color text in both modes.
    // MUI's default derives the tint by darkening/lightening `light`, which
    // washes out on a dark surface.
    MuiAlert: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const c = theme.palette[ownerState.severity || "info"];
          if (!c || (ownerState.variant && ownerState.variant !== "standard")) return {};
          return {
            backgroundColor: c.light,
            color: theme.palette.text.primary,
            border: `1px solid ${alpha(c.main, 0.35)}`,
            "& .MuiAlert-icon": { color: c.main },
          };
        },
      },
    },
  },
};

function accentFor(mode) {
  const t = getTokens(mode);
  return { main: t.accent.main, dark: t.accent.dark, light: t.accent.light, contrastText: t.accent.contrastText };
}

export const lightTheme = createTheme({
  ...shared,
  palette: { ...buildPalette("light"), accent: accentFor("light") },
});

export const darkTheme = createTheme({
  ...shared,
  palette: { ...buildPalette("dark"), accent: accentFor("dark") },
});