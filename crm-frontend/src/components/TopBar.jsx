import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, TextField, InputAdornment,
  IconButton, Avatar, Menu, MenuItem, Divider,
  ListItemIcon, ListItemText, Button, Badge, Tooltip, Chip,
} from "@mui/material";
import {
  Search, HelpCircle, Bell, Settings, LogOut, Smile, User,
  Plus, TrendingUp, UserPlus, Building2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import GlobalSearchModal from "./GlobalSearchModal";
import NewOpportunityModal from "./NewOpportunityModal";
import NewLeadModal from "./NewLeadModal";
import NewContactModal from "./NewContactModal";
import NewAccountModal from "./NewAccountModal";

// Maps route paths to display labels for the secondary nav breadcrumb tab
const PAGE_LABELS = {
  "/": "Home",
  "/pipeline": "Pipeline",
  "/accounts": "Accounts",
  "/contacts": "Contacts",
  "/leads": "Leads",
  "/products": "Products",
  "/users": "Users",
  "/settings": "Settings",
  "/faqs": "Help & FAQs",
  "/notifications": "Notifications",
  "/profile": "My Profile",
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const { unreadCount, syncWithBackend } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  // Search & Global Create states
  const [searchOpen, setSearchOpen] = useState(false);
  const [createMenuAnchor, setCreateMenuAnchor] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // "opp" | "lead" | "contact" | "account"

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` : "";

  // Resolve the active page label for the secondary nav breadcrumb tab
  const currentLabel = (() => {
    for (const [path, label] of Object.entries(PAGE_LABELS)) {
      if (path === "/") {
        if (location.pathname === "/") return label;
      } else if (location.pathname.startsWith(path)) {
        return label;
      }
    }
    return "Home";
  })();

  return (
    <Box sx={{ flexShrink: 0 }}>
      {/* ── Announcement banner ──────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "#4A26C8",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          py: "5px",
          px: 2,
        }}
      >
        <Smile size={14} style={{ flexShrink: 0, color: "#fff" }} />
        <Typography component="span" sx={{ fontSize: 12.5, fontWeight: 500, color: "#fff" }}>
          Upgrade to grow your business faster.
        </Typography>
        <Button
          size="small"
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "rgba(255,255,255,0.7)",
            fontSize: 11.5,
            py: "1px",
            px: 1.25,
            minWidth: 0,
            lineHeight: 1.6,
            "&:hover": { bgcolor: "rgba(255,255,255,0.12)", borderColor: "#fff" },
          }}
        >
          Compare Plans
        </Button>
      </Box>

      {/* ── Main top bar ─────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 1,
          minHeight: 48,
        }}
      >
        {/* Global Omnisearch Command Input */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Box
            onClick={() => setSearchOpen(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: "5px",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
              cursor: "pointer",
              width: { xs: 180, sm: 260, md: 340 },
              transition: "all 0.15s ease",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "background.paper",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              },
            }}
          >
            <Search size={14} color="#6B6B6B" />
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", flex: 1 }}>
              Search CRM (deals, leads, accounts)…
            </Typography>
            <Chip
              label="⌘K"
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 700,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                fontFamily: "'IBM Plex Mono', monospace",
                display: { xs: "none", sm: "flex" },
              }}
            />
          </Box>
        </Box>

        {/* Right-side utility & creation icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* Global Create "+" Menu */}
          <Tooltip title="Global Quick Create (+)">
            <IconButton
              size="small"
              onClick={(e) => setCreateMenuAnchor(e.currentTarget)}
              sx={{
                bgcolor: "primary.main",
                color: "#FFFFFF",
                width: 28,
                height: 28,
                mr: 0.5,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <Plus size={16} />
            </IconButton>
          </Tooltip>

          {/* Help & FAQs */}
          <IconButton size="small" title="Help & FAQs" onClick={() => navigate("/faqs")}>
            <HelpCircle size={18} />
          </IconButton>

          {/* Settings */}
          <IconButton size="small" title="Settings" onClick={() => navigate("/settings")}>
            <Settings size={18} />
          </IconButton>

          {/* Notifications with real-time Badge */}
          <IconButton size="small" title="Notifications" onClick={() => navigate("/notifications")}>
            <Badge badgeContent={unreadCount} color="error" max={99} sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 } }}>
              <Bell size={18} />
            </Badge>
          </IconButton>

          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: "primary.main" }}>{initials}</Avatar>
          </IconButton>
        </Box>

        {/* Global Quick Create Menu */}
        <Menu
          anchorEl={createMenuAnchor}
          open={!!createMenuAnchor}
          onClose={() => setCreateMenuAnchor(null)}
          PaperProps={{ sx: { width: 220, mt: 0.5 } }}
        >
          <Box sx={{ px: 2, py: 1, bgcolor: "action.hover", borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
              Global Quick Create
            </Typography>
          </Box>
          <MenuItem
            onClick={() => {
              setCreateMenuAnchor(null);
              setActiveModal("opp");
            }}
          >
            <ListItemIcon><TrendingUp size={16} color="#1160B7" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}>New Opportunity</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setCreateMenuAnchor(null);
              setActiveModal("lead");
            }}
          >
            <ListItemIcon><UserPlus size={16} color="#2E7D46" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}>New Lead</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setCreateMenuAnchor(null);
              setActiveModal("contact");
            }}
          >
            <ListItemIcon><User size={16} color="#5E7CE2" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}>New Contact</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setCreateMenuAnchor(null);
              setActiveModal("account");
            }}
          >
            <ListItemIcon><Building2 size={16} color="#B25E09" /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}>New Account</ListItemText>
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { width: 220, mt: 0.5 } }}
        >
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize", display: "block" }}>
              {user?.role?.replace("_", " ")}
            </Typography>
            {user?.email && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: 11, mt: 0.25 }}>
                {user.email}
              </Typography>
            )}
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/profile");
            }}
          >
            <ListItemIcon><User size={16} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>My Profile</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/settings");
            }}
          >
            <ListItemIcon><Settings size={16} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Settings</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/notifications");
            }}
          >
            <ListItemIcon><Bell size={16} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/faqs");
            }}
          >
            <ListItemIcon><HelpCircle size={16} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Help & FAQs</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogOut size={16} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 13 }}>Log out</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* ── Secondary nav / breadcrumb bar ───────────────────────── */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "flex-end",
          px: 2,
          minHeight: 34,
          gap: 0,
        }}
      >
        {/* Show "Home /" parent only when NOT on the root route — avoids "Home Home" duplication */}
        {currentLabel !== "Home" && (
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: "text.secondary",
              pb: "7px",
              pr: 1.5,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            Home
          </Typography>
        )}

        {/* Active page tab — Salesforce-style underline tab */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            pb: "5px",
            borderBottom: 2,
            borderColor: "primary.main",
            px: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "primary.main",
              lineHeight: 1,
            }}
          >
            {currentLabel}
          </Typography>
        </Box>
      </Box>

      {/* ── Global Omnisearch Command Palette Modal ──────────── */}
      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenNewDeal={() => setActiveModal("opp")}
        onOpenNewLead={() => setActiveModal("lead")}
      />

      {/* ── Global Quick Create Modals ───────────────────────── */}
      {activeModal === "opp" && (
        <NewOpportunityModal
          onClose={() => setActiveModal(null)}
          onCreated={(opp) => {
            setActiveModal(null);
            syncWithBackend();
            navigate(`/opportunities/${opp.opportunity_id}`);
          }}
        />
      )}
      {activeModal === "lead" && (
        <NewLeadModal
          onClose={() => setActiveModal(null)}
          onCreated={() => {
            setActiveModal(null);
            syncWithBackend();
            navigate("/leads");
          }}
        />
      )}
      {activeModal === "contact" && (
        <NewContactModal
          onClose={() => setActiveModal(null)}
          onCreated={(contact) => {
            setActiveModal(null);
            navigate(`/contacts/${contact.contact_id}`);
          }}
        />
      )}
      {activeModal === "account" && (
        <NewAccountModal
          onClose={() => setActiveModal(null)}
          onCreated={(acc) => {
            setActiveModal(null);
            navigate(`/accounts/${acc.account_id}`);
          }}
        />
      )}
    </Box>
  );
}