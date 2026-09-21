import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "../theme";

// Wrap your whole app with this (in main.jsx or App.jsx — see wiring notes).
// Replaces ThemeToggle's old standalone localStorage logic with one shared
// source of truth: same 'crm-theme' key, so an existing saved preference
// carries over with no migration step needed.
//
// Still sets data-theme on <html> alongside the MUI ThemeProvider, so pages
// that haven't been converted to MUI yet keep working exactly as before —
// both systems flip together from the same toggle during the migration.

const ThemeModeContext = createContext(null);

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used inside ThemeModeProvider");
  return ctx;
}

export default function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("crm-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("crm-theme", mode);
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  const value = useMemo(() => ({ mode, toggleMode }), [mode]);
  const muiTheme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}