import React from "react";
import { Sun, Moon } from "lucide-react";
import { Box, Typography } from "@mui/material";
import { useThemeMode } from "../context/ThemeModeProvider";

// expanded=false collapses to a centered icon-only button, matching the
// sidebar's collapsed nav items.
export default function ThemeToggle({ expanded = true }) {
  const { mode, toggleMode } = useThemeMode();
  const Icon = mode === "dark" ? Sun : Moon;

  return (
    <Box
      component="button"
      onClick={toggleMode}
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      sx={{
        display: "flex", alignItems: "center", gap: 1,
        width: "100%", background: "none", border: "none", cursor: "pointer",
        color: "#C9D6E8", fontFamily: "inherit", borderRadius: 1.5,
        py: 1, px: expanded ? 1.25 : 0,
        justifyContent: expanded ? "flex-start" : "center",
        mb: 0.5,
        "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" },
      }}
    >
      <Icon size={14} />
      {expanded && (
        <Typography sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>
          {mode === "dark" ? "Light mode" : "Dark mode"}
        </Typography>
      )}
    </Box>
  );
}