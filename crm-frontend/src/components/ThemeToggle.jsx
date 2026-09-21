import React from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeMode } from "../context/ThemeModeProvider";

// Kept as a plain button (not MUI) for now, since Sidebar.jsx itself isn't
// converted yet — matches the existing .theme-toggle CSS. Swap to an MUI
// IconButton once the sidebar gets its turn in the migration.
export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  return (
    <button className="theme-toggle" onClick={toggleMode} title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      {mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      <span>{mode === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}