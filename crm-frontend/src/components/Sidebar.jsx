import React from "react";
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

// Active state computed explicitly with useMatch instead of relying on
// NavLink's auto-applied "active" CSS class — that class-matching approach
// is what caused the oversized/inconsistent active pill. This way there's
// no class name involved at all: isActive is a plain boolean driving sx.
function SidebarNavItem({ to, end, label, icon: Icon }) {
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
        px: 1.25,
        minHeight: 38,
        boxSizing: "border-box",
        color: isActive ? "#fff" : "#C9D6E8",
        bgcolor: isActive ? "primary.main" : "transparent",
        fontSize: 13,
        fontWeight: 500,
        "&:hover": { bgcolor: isActive ? "primary.main" : "rgba(255,255,255,0.06)", color: "#fff" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 30, color: "inherit" }}><Icon size={16} /></ListItemIcon>
      <ListItemText disableTypography sx={{ fontSize: 13, fontWeight: 500, m: 0 }}>{label}</ListItemText>
    </ListItemButton>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const canManageUsers = user && (user.role === "admin" || user.role === "manager");

  return (
    <Box sx={{ width: 208, flexShrink: 0, bgcolor: "#002050", color: "#fff", display: "flex", flexDirection: "column", p: 1.5 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 15, px: 1.25, pb: 2.5, letterSpacing: "-0.01em" }}>
        Cirrus <Box component="span" sx={{ color: "#6FA8E0" }}>CRM</Box>
      </Typography>

      <ThemeToggle />

      <List disablePadding sx={{ mt: 0.5 }}>
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.to} to={item.to} end={item.end} label={item.label} icon={item.icon} />
        ))}
        {canManageUsers && (
          <SidebarNavItem to="/users" label="Users" icon={ShieldCheck} />
        )}
      </List>

      <Box sx={{ mt: "auto", pt: 1.5 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1.5 }} />
        {user && (
          <Box sx={{ px: 1.25, pb: 1.25 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>{user.first_name} {user.last_name}</Typography>
            <Typography sx={{ fontSize: 11, color: "#8FA6C4", textTransform: "capitalize" }}>{user.role}</Typography>
          </Box>
        )}
        <ListItemButton
          onClick={handleLogout}
          disableGutters
          sx={{ borderRadius: 1.5, py: 1, px: 1.25, minHeight: 38, color: "#C9D6E8", "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" } }}
        >
          <ListItemIcon sx={{ minWidth: 30, color: "inherit" }}><LogOut size={16} /></ListItemIcon>
          <ListItemText disableTypography sx={{ fontSize: 13, fontWeight: 500, m: 0 }}>Log out</ListItemText>
        </ListItemButton>
      </Box>
    </Box>
  );
}