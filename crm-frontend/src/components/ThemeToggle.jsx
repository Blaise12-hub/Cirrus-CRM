import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Drop <ThemeToggle /> into Sidebar.jsx's footer, near the logout button.
// Sets data-theme="dark" on <html>, which index.css's dark overrides key off.
// Also add the tiny inline script below to index.html's <head> (see wiring
// notes) so the theme applies before React mounts — avoids a light-mode flash.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("crm-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button className="theme-toggle" onClick={toggle} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}