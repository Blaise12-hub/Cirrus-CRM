import { createTheme } from "@mui/material/styles";

// Palette sampled directly from the brand image: navy #002050, light gray
// #DFE2E8, medium blue #1160B7, light blue #B1D6F0, terracotta #D24726.
// Semantic colors (error/success/warning) reuse the exact hex values already
// established in index.css's dark-mode CSS pass — same red/green/amber
// everywhere, not a second palette invented for MUI specifically.

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
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: "light",
    primary: { main: "#1160B7", dark: "#0A3E7A" },
    error: { main: "#B3261E" },
    success: { main: "#2E7D46" },
    warning: { main: "#B25E09" },
    info: { main: "#5E7CE2" },
    background: { default: "#DFE2E8", paper: "#FFFFFF" },
    text: { primary: "#1A1A1A", secondary: "#6B6B6B" },
    divider: "#D8D8D8",
    // Custom fifth palette color (terracotta) — not part of MUI's standard
    // palette keys, works fine in plain JS via sx={{ color: 'accent.main' }}.
    accent: { main: "#D24726", contrastText: "#FFFFFF" },
  },
});

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: "dark",
    primary: { main: "#4A9EFF", dark: "#7AB8FF" },
    error: { main: "#B3261E" },
    success: { main: "#2E7D46" },
    warning: { main: "#B25E09" },
    info: { main: "#5E7CE2" },
    background: { default: "#14161C", paper: "#1D2029" },
    text: { primary: "#EDEDEF", secondary: "#9498A3" },
    divider: "#2E323D",
    accent: { main: "#D24726", contrastText: "#FFFFFF" },
  },
});