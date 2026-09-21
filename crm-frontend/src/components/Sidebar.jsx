import React, { useState } from "react";
import { useNavigate, useMatch, useResolvedPath, NavLink } from "react-router-dom";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from "@mui/material";
import { LayoutDashboard, Building2, Users, UserPlus, Target, LogOut, ShieldCheck, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/pipeline", label: "Pipeline", icon: Target },
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/leads", label: "Leads", icon: UserPlus },
  { to: "/products", label: "Products", icon: Package },
];

const COLLAPSED_WIDTH = 68;
const EXPANDED_WIDTH = 208;

// PUSH layout, not overlay: the sidebar is a normal flex child with an
// animated width, and AppLayout's .main-area is flex:1 — it reflows
// automatically as the width transitions. No fixed/absolute positioning,
// no manual margin-left calculation to keep in sync. That class of bug
// (content misaligned or pushed off) can't happen with this approach,
// since the browser's flexbox engine is doing the layout, not JS math.
function SidebarNavItem({ to, end, label, icon: Icon, expanded }) {
  const resolved = useResolvedPath(to);
  const isActive = !!useMatch({ path: resolved.pathname, end });

  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={end}
      disableGutters
      sx={{
        borderRadius: 1.5,
        mb: 0.25,
        py: 1,
        px: expanded ? 1.25 : 0,
        minHeight: 38,
        justifyContent: expanded ? "flex-start" : "center",
        color: isActive ? "#fff" : "#C9D6E8",
        bgcolor: isActive ? "primary.main" : "transparent",
        "&:hover": { bgcolor: isActive ? "primary.main" : "rgba(255,255,255,0.06)", color: "#fff" },
      }}
    >
      <ListItemIcon sx={{ minWidth: expanded ? 30 : "auto", color: "inherit", justifyContent: "center" }}>
        <Icon size={16} />
      </ListItemIcon>
      {expanded && (
        <ListItemText disableTypography sx={{ fontSize: 13, fontWeight: 500, m: 0, whiteSpace: "nowrap" }}>
          {label}
        </ListItemText>
      )}
    </ListItemButton>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const canManageUsers = user && (user.role === "admin" || user.role === "manager");

  return (
    <Box
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      sx={{
        width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        bgcolor: "#002050",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        p: 1.5,
        transition: "width 0.18s ease",
        overflow: "hidden",
      }}
    >
      <Typography
        noWrap
        sx={{
          fontWeight: 700, fontSize: 15, pb: 2.5, letterSpacing: "-0.01em",
          px: expanded ? 1.25 : 0, textAlign: expanded ? "left" : "center",
        }}
      >
        {expanded ? <>Cirrus <Box component="span" sx={{ color: "#6FA8E0" }}>CRM</Box></> : "C"}
      </Typography>

      <ThemeToggle expanded={expanded} />

      <List disablePadding sx={{ mt: 0.5 }}>
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.to} to={item.to} end={item.end} label={item.label} icon={item.icon} expanded={expanded} />
        ))}
        {canManageUsers && (
          <SidebarNavItem to="/users" label="Users" icon={ShieldCheck} expanded={expanded} />
        )}
      </List>

      <Box sx={{ mt: "auto", pt: 1.5 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1.5 }} />
        {user && expanded && (
          <Box sx={{ px: 1.25, pb: 1.25 }}>
            <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>{user.first_name} {user.last_name}</Typography>
            <Typography sx={{ fontSize: 11, color: "#8FA6C4", textTransform: "capitalize" }}>{user.role}</Typography>
          </Box>
        )}
        <ListItemButton
          onClick={handleLogout}
          disableGutters
          sx={{
            borderRadius: 1.5, py: 1, px: expanded ? 1.25 : 0, minHeight: 38,
            justifyContent: expanded ? "flex-start" : "center",
            color: "#C9D6E8", "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" },
          }}
        >
          <ListItemIcon sx={{ minWidth: expanded ? 30 : "auto", color: "inherit", justifyContent: "center" }}>
            <LogOut size={16} />
          </ListItemIcon>
          {expanded && (
            <ListItemText disableTypography sx={{ fontSize: 13, fontWeight: 500, m: 0, whiteSpace: "nowrap" }}>
              Log out
            </ListItemText>
          )}
        </ListItemButton>
      </Box>
    </Box>
  );
}