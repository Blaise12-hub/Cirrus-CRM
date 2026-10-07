import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Avatar, Chip, Alert, Divider, Switch, FormControlLabel,
  Table, TableHead, TableBody, TableRow, TableCell,
  InputAdornment, LinearProgress, IconButton, Tooltip, Menu, MenuItem
} from "@mui/material";
import {
  User, Shield, Clock, Award, KeyRound, Check,
  Mail, Phone, Building, MapPin, Briefcase, Calendar,
  Smartphone, Laptop, Globe, ChevronRight, ChevronDown,
  Sparkles, Activity, ShoppingCart, UserCheck, Flame,
  Share2, MoreVertical, Atom, CheckCircle2, AlertTriangle,
  FolderKanban, ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSnackbar } from "../context/SnackbarContext";
import { usersApi } from "../api/resources";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showSnackbar } = useSnackbar ? useSnackbar() : { showSnackbar: () => {} };
  const [subTab, setSubTab] = useState("overview"); // "overview" | "edit" | "security" | "preferences"

  // Dropdown menu state
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Profile Information form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "+1 (555) 234-5678",
    title: user?.title || (user?.role === "admin" ? "Senior CRM Administrator" : user?.role === "manager" ? "Sales Director" : "Senior Account Executive"),
    department: user?.department || "Enterprise Cloud Division",
    location: user?.location || "San Francisco, CA (HQ)",
    bio: user?.bio || "Focused on enterprise cloud solutions, strategic accounts, and high-velocity deal pipelines.",
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    timezone: "America/Los_Angeles (PST - UTC-8)",
    workStart: "08:30",
    workEnd: "17:30",
    dateFormat: "MM/DD/YYYY",
    defaultView: "Dashboard",
    twoFactorEnabled: true,
    emailSignature: `---\nBest regards,\n${user?.first_name || "Sales"} ${user?.last_name || "Representative"}\nCirrus CRM Solutions | Enterprise Cloud Division\nDirect: +1 (555) 234-5678`,
  });

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Next Best Actions state
  const [actionsDismissed, setActionsDismissed] = useState([]);

  const initials = `${profileForm.first_name?.[0] || "C"}${profileForm.last_name?.[0] || "R"}`;

  const handleProfileChange = (field) => (e) => {
    setProfileForm({ ...profileForm, [field]: e.target.value });
    setProfileSuccess("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    try {
      if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
        setProfileError("First and last name cannot be empty.");
        return;
      }
      if (user?.user_id) {
        try {
          await usersApi.update(user.user_id, {
            first_name: profileForm.first_name,
            last_name: profileForm.last_name,
          });
        } catch {
          // Continue updating client context
        }
      }
      updateUser({
        ...user,
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
        phone: profileForm.phone,
        title: profileForm.title,
        department: profileForm.department,
        location: profileForm.location,
        bio: profileForm.bio,
      });
      setProfileSuccess("Profile updated successfully!");
      if (showSnackbar) showSnackbar("Profile details updated successfully", "success");
    } catch (err) {
      setProfileError(err.message || "Failed to save profile changes.");
      if (showSnackbar) showSnackbar("Failed to update profile", "error");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      if (user?.user_id) {
        await usersApi.setPassword(user.user_id, passwordForm.newPassword);
      }
      setPasswordSuccess("Your password was updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      if (showSnackbar) showSnackbar("Password changed successfully", "success");
    } catch (err) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };
  const pwdScore = calculatePasswordStrength(passwordForm.newPassword);

  return (
    <Box className="view fade-in-up" sx={{ pb: 4 }}>
      {/* ── Salesforce-Style Object Header & Highlights Panel ───────────────────────── */}
      <Box sx={{ mb: 2 }}>
        {/* Breadcrumb row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, fontSize: 12, color: "text.secondary" }}>
          <span>Home</span>
          <ChevronRight size={14} />
          <span>Customer & User Profiles</span>
          <ChevronRight size={14} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "primary.main" }}>
            {profileForm.first_name} {profileForm.last_name}
          </Typography>
        </Box>

        {/* Highlights panel card */}
        <Card sx={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden" }}>
          <Box sx={{ p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  fontSize: 22,
                  fontWeight: 700,
                  bgcolor: "#002050",
                  color: "#FFFFFF",
                  border: "2px solid #0176D3",
                  boxShadow: "0 2px 8px rgba(1, 118, 211, 0.25)",
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 22 }, letterSpacing: "-0.01em" }}>
                    {profileForm.first_name} {profileForm.last_name}
                  </Typography>
                  <Chip
                    label={user?.role ? user.role.toUpperCase() : "SALES REP"}
                    size="small"
                    sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: "#E8F2FD", color: "#0176D3" }}
                  />
                  <Chip
                    label="Gold Tier Performer"
                    size="small"
                    sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: "#FEF3D6", color: "#B25E09" }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 12.5 }}>
                  {profileForm.title} • {profileForm.department} • {profileForm.location}
                </Typography>
              </Box>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                size="small"
                variant={subTab === "edit" ? "contained" : "outlined"}
                onClick={() => setSubTab("edit")}
                startIcon={<User size={14} />}
                sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600 }}
              >
                Edit Profile
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  if (showSnackbar) showSnackbar("Profile link copied to clipboard", "info");
                }}
                startIcon={<Share2 size={14} />}
                sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600 }}
              >
                Share
              </Button>
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ border: "1px solid var(--color-border)", borderRadius: "6px" }}>
                <MoreVertical size={16} />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem onClick={() => { setSubTab("security"); setMenuAnchor(null); }}>
                  <Shield size={14} style={{ marginRight: 8 }} /> Security Settings
                </MenuItem>
                <MenuItem onClick={() => { setSubTab("preferences"); setMenuAnchor(null); }}>
                  <Clock size={14} style={{ marginRight: 8 }} /> Regional Preferences
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Highlights Metrics Strip */}
          <Divider />
          <Box sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            bgcolor: "action.hover",
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: 2,
          }}>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Rep ID</Typography>
              <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, mt: 0.25 }}>
                #CR-987654321
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Tier Level</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#EA6C10", mt: 0.25 }}>
                Gold Sales Leader
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Lifetime Won</Typography>
              <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, color: "success.main", mt: 0.25 }}>
                $1,540,000
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Q3 Target Attainment</Typography>
              <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, color: "primary.main", mt: 0.25 }}>
                74.1% ($185.4K)
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* ── Sub Navigation Tabs (Matches Pro Template) ─────────────────────────────────── */}
      <Box className="sf-subnav">
        <button
          className={`sf-tab ${subTab === "overview" ? "active" : ""}`}
          onClick={() => setSubTab("overview")}
        >
          <Activity size={15} />
          Rep Overview & Activity
        </button>
        <button
          className={`sf-tab ${subTab === "edit" ? "active" : ""}`}
          onClick={() => setSubTab("edit")}
        >
          <User size={15} />
          Edit Profile
        </button>
        <button
          className={`sf-tab ${subTab === "security" ? "active" : ""}`}
          onClick={() => setSubTab("security")}
        >
          <Shield size={15} />
          Security & 2FA
        </button>
        <button
          className={`sf-tab ${subTab === "preferences" ? "active" : ""}`}
          onClick={() => setSubTab("preferences")}
        >
          <Clock size={15} />
          Preferences & Schedule
        </button>
      </Box>

      {/* ── TAB CONTENT: Overview (The Pro 3-Column Template) ────────────────────────── */}
      {subTab === "overview" && (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "260px 1fr 340px" },
          gap: 2.5,
          alignItems: "start"
        }}>
          {/* ── LEFT COLUMN: Identity & Quick Attributes ─────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card className="sf-card">
              <Box sx={{ textAlign: "center", pb: 2, borderBottom: "1px solid var(--color-border)" }}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: 26,
                    fontWeight: 700,
                    bgcolor: "#002050",
                    color: "#FFFFFF",
                    margin: "0 auto 12px auto",
                    border: "3px solid #0176D3",
                  }}
                >
                  {initials}
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                  {profileForm.first_name} {profileForm.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {profileForm.title}
                </Typography>
                <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 1 }}>
                  <Chip label="Bronze" size="small" sx={{ height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: "#D78E58", color: "#FFFFFF" }} />
                  <Chip label="Loyalty Member" size="small" sx={{ height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: "#9333EA", color: "#FFFFFF" }} />
                </Box>
              </Box>

              <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Account Number</Typography>
                  <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, mt: 0.25 }}>
                    987654321
                  </Typography>
                </Box>
                <Box>
                  <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Email Contact</Typography>
                  <Typography sx={{ fontSize: 12.5, color: "primary.main", fontWeight: 500, mt: 0.25, wordBreak: "break-all" }}>
                    {profileForm.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Direct Phone</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 500, mt: 0.25 }}>
                    {profileForm.phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>HQ Location</Typography>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 500, mt: 0.25 }}>
                    {profileForm.location}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>2FA Security</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                    <CheckCircle2 size={14} color="#2E7D46" />
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "success.main" }}>
                      Enforced & Verified
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>

            <Card className="sf-card">
              <Box className="sf-card-header" sx={{ mb: 1 }}>
                <Typography className="sf-card-title" sx={{ fontSize: 12.5 }}>
                  <Award size={15} color="#0176D3" /> Skills & Badges
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                <Chip label="MedDPICC Master" size="small" variant="outlined" sx={{ fontSize: 10.5, height: 22 }} />
                <Chip label="Enterprise SaaS" size="small" variant="outlined" sx={{ fontSize: 10.5, height: 22 }} />
                <Chip label="Cloud Migration" size="small" variant="outlined" sx={{ fontSize: 10.5, height: 22 }} />
                <Chip label="Security Compliant" size="small" variant="outlined" sx={{ fontSize: 10.5, height: 22 }} />
                <Chip label="Q2 President's Club" size="small" sx={{ fontSize: 10.5, height: 22, bgcolor: "#FEF3D6", color: "#B25E09", fontWeight: 700 }} />
              </Box>
            </Card>
          </Box>

          {/* ── CENTER COLUMN: Details, Spending Profile, Patterns, Next Actions ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Card 1: Shopper / Rep Details (Template match) */}
            <Card className="sf-card">
              <Box className="sf-card-header">
                <Typography className="sf-card-title">
                  Shopper / Rep Details
                </Typography>
                <IconButton size="small">
                  <ChevronDown size={16} />
                </IconButton>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2, pt: 0.5 }}>
                <Box>
                  <Typography className="sf-card-subtitle">Segment Membership</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0176D3" }}>
                      Loyalty Members
                    </Typography>
                    <Box sx={{ width: 14, height: 14, bgcolor: "#9333EA", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 9, fontWeight: 800 }}>
                      C
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Typography className="sf-card-subtitle">Average Order ($)</Typography>
                  <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 700, mt: 0.5 }}>
                    $120
                  </Typography>
                </Box>
                <Box>
                  <Typography className="sf-card-subtitle">Sizes Purchased</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 0.5 }}>
                    5T, 7.5, 9
                  </Typography>
                </Box>
                <Box>
                  <Typography className="sf-card-subtitle">First Purchase Date</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 0.5 }}>
                    January 31, 2022
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Card 2: Spending Profile & Engagement Patterns (Exact match from template image) */}
            <Card className="sf-card">
              <Box className="sf-card-header">
                <Typography className="sf-card-title">
                  Spending Profile
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  New Customer
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.1fr 1fr" }, gap: 3, my: 1 }}>
                {/* Lifetime Spend Comparison */}
                <Box>
                  <Typography className="sf-card-subtitle" sx={{ mb: 1.5 }}>
                    Lifetime Spend
                  </Typography>
                  <Box className="sf-comp-row">
                    <Typography className="sf-comp-label">$1.5k</Typography>
                    <Box className="sf-comp-bar primary" sx={{ width: "65%" }} />
                  </Box>
                  <Box className="sf-comp-row">
                    <Typography className="sf-comp-label">$2.7k</Typography>
                    <Box className="sf-comp-bar neutral" sx={{ width: "95%" }} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, pl: 7 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 11, color: "text.secondary" }}>
                      <Box sx={{ width: 9, height: 9, bgcolor: "#0176D3", borderRadius: "1px" }} />
                      <span>{profileForm.first_name || "Marjorie"}</span>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 11, color: "text.secondary" }}>
                      <Box sx={{ width: 9, height: 9, bgcolor: "#B6C2D1", borderRadius: "1px" }} />
                      <span>Avg. Customer</span>
                    </Box>
                  </Box>
                </Box>

                {/* Most Used Channels */}
                <Box>
                  <Typography className="sf-card-subtitle" sx={{ mb: 1.5 }}>
                    Most Used Channels
                  </Typography>
                  <Box className="sf-channel-row">
                    <Smartphone size={16} style={{ color: "#6B7280" }} />
                    <Box className="sf-channel-pill">
                      <Box className="sf-channel-fill" sx={{ width: "72%" }}>
                        72%
                      </Box>
                    </Box>
                  </Box>
                  <Box className="sf-channel-row">
                    <Laptop size={16} style={{ color: "#6B7280" }} />
                    <Box className="sf-channel-pill">
                      <Box className="sf-channel-fill" sx={{ width: "28%" }}>
                        28%
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Engagement Patterns (Heatmap & Histogram from image) */}
              <Box>
                <Typography className="sf-card-subtitle" sx={{ mb: 1 }}>
                  Engagement Patterns
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                  {/* Days of Week Heatmap */}
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
                      Days of Week
                    </Typography>
                    <Box className="sf-heatmap-grid">
                      {[
                        { day: "Su", bg: "#C6DBF5" },
                        { day: "M", bg: "#D4E5F9" },
                        { day: "T", bg: "#8CB9F0" },
                        { day: "W", bg: "#4E97EB" },
                        { day: "Th", bg: "#1D78E2" },
                        { day: "F", bg: "#015BB5" },
                        { day: "Sa", bg: "#0176D3" },
                      ].map((item, idx) => (
                        <Box key={idx} className="sf-heatmap-cell">
                          <Typography className="sf-heatmap-day">{item.day}</Typography>
                          <Box className="sf-heatmap-block" sx={{ bgcolor: item.bg }} />
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Times of Day Histogram */}
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
                      Times of Day
                    </Typography>
                    <Box className="sf-histogram-grid">
                      {[
                        { time: "12a", h: "15%", muted: true },
                        { time: "", h: "10%", muted: true },
                        { time: "4a", h: "12%", muted: true },
                        { time: "", h: "20%", muted: true },
                        { time: "8a", h: "45%", muted: true },
                        { time: "", h: "60%", muted: true },
                        { time: "12p", h: "95%", muted: false },
                        { time: "", h: "85%", muted: false },
                        { time: "4p", h: "40%", muted: true },
                        { time: "", h: "30%", muted: true },
                        { time: "8p", h: "20%", muted: true },
                        { time: "12a", h: "10%", muted: true },
                      ].map((col, idx) => (
                        <Box key={idx} className="sf-histogram-col">
                          <Box className={`sf-histogram-bar ${col.muted ? "muted" : ""}`} sx={{ height: col.h }} />
                          {col.time ? <Typography className="sf-histogram-time">{col.time}</Typography> : <Box sx={{ height: 14 }} />}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Card 3: Next Best Actions (Template match) */}
            <Card className="sf-next-action">
              <Box className="sf-next-action-header">
                <Box className="sf-next-action-title">
                  <Atom size={20} color="#0176D3" />
                  Next Best Actions
                </Box>
                <IconButton size="small">
                  <ChevronDown size={16} />
                </IconButton>
              </Box>

              {!actionsDismissed.includes(1) && (
                <Box className="sf-next-action-row" sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box className="sf-action-icon-ring">
                      <Sparkles size={16} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                        Add to Nurture Campaign
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Put this user on the right track for Q4 enterprise conversion.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <button
                      className="sf-action-btn-secondary"
                      onClick={() => setActionsDismissed([...actionsDismissed, 1])}
                    >
                      Not Helpful
                    </button>
                    <button
                      className="sf-action-btn-primary"
                      onClick={() => {
                        if (showSnackbar) showSnackbar("Added user to Nurture Campaign!", "success");
                        setActionsDismissed([...actionsDismissed, 1]);
                      }}
                    >
                      Take Action
                    </button>
                  </Box>
                </Box>
              )}

              {!actionsDismissed.includes(2) && (
                <Box className="sf-next-action-row">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box className="sf-action-icon-ring" sx={{ borderColor: "#0176D3", color: "#0176D3" }}>
                      <Activity size={16} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                        Schedule Executive Briefing
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        High-velocity deals over $100K benefit from 1-on-1 VP sponsor alignment.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <button
                      className="sf-action-btn-secondary"
                      onClick={() => setActionsDismissed([...actionsDismissed, 2])}
                    >
                      Not Helpful
                    </button>
                    <button
                      className="sf-action-btn-primary"
                      onClick={() => {
                        if (showSnackbar) showSnackbar("Executive briefing invited successfully!", "success");
                        setActionsDismissed([...actionsDismissed, 2]);
                      }}
                    >
                      Take Action
                    </button>
                  </Box>
                </Box>
              )}
            </Card>
          </Box>

          {/* ── RIGHT COLUMN: Engagement Feed (Exact Match From Template) ─────── */}
          <Box>
            <Card className="sf-card">
              <Box className="sf-card-header" sx={{ mb: 2 }}>
                <Typography className="sf-card-title" sx={{ fontSize: 14 }}>
                  <Activity size={18} color="#0176D3" /> Engagement Feed
                </Typography>
              </Box>

              <Box className="sf-timeline">
                {/* Item 1 */}
                <Box className="sf-timeline-row">
                  <ChevronRight size={14} className="sf-timeline-expand" />
                  <Box className="sf-timeline-badge green">
                    <ShoppingCart size={16} />
                  </Box>
                  <Box className="sf-timeline-body">
                    <Typography className="sf-timeline-title">
                      Online Purchase
                    </Typography>
                    <Typography className="sf-timeline-meta">
                      Subtotal: $56.27
                    </Typography>
                    <Typography className="sf-timeline-time">
                      September 1, 2022 • 10:27 AM EDT
                    </Typography>
                  </Box>
                </Box>

                {/* Item 2 */}
                <Box className="sf-timeline-row">
                  <ChevronRight size={14} className="sf-timeline-expand" />
                  <Box className="sf-timeline-badge teal">
                    <UserCheck size={16} />
                  </Box>
                  <Box className="sf-timeline-body">
                    <Typography className="sf-timeline-title">
                      Loyalty Members Account Created
                    </Typography>
                    <Typography className="sf-timeline-time">
                      August 15, 2022 • 5:27 PM EDT
                    </Typography>
                  </Box>
                </Box>

                {/* Item 3 */}
                <Box className="sf-timeline-row">
                  <ChevronRight size={14} className="sf-timeline-expand" />
                  <Box className="sf-timeline-badge orange">
                    <Flame size={16} />
                  </Box>
                  <Box className="sf-timeline-body">
                    <Typography className="sf-timeline-title">
                      Added to Campaign
                    </Typography>
                    <Typography className="sf-timeline-meta">
                      Campaign: Welcome to Loyalty...<br />Status: Complete
                    </Typography>
                  </Box>
                </Box>

                {/* Item 4 */}
                <Box className="sf-timeline-row">
                  <ChevronRight size={14} className="sf-timeline-expand" />
                  <Box className="sf-timeline-badge green">
                    <ShoppingCart size={16} />
                  </Box>
                  <Box className="sf-timeline-body">
                    <Typography className="sf-timeline-title">
                      Online Purchase
                    </Typography>
                    <Typography className="sf-timeline-meta">
                      Subtotal: $140.56
                    </Typography>
                    <Typography className="sf-timeline-time">
                      March 7, 2022 • 08:05 AM EDT
                    </Typography>
                  </Box>
                </Box>

                {/* Item 5 */}
                <Box className="sf-timeline-row">
                  <ChevronRight size={14} className="sf-timeline-expand" />
                  <Box className="sf-timeline-badge orange">
                    <Flame size={16} />
                  </Box>
                  <Box className="sf-timeline-body">
                    <Typography className="sf-timeline-title">
                      Added to Campaign
                    </Typography>
                    <Typography className="sf-timeline-meta">
                      Campaign: Winter Sales<br />Status: Complete
                    </Typography>
                  </Box>
                </Box>

                {/* Item 6 */}
                <Box className="sf-timeline-row">
                  <ChevronRight size={14} className="sf-timeline-expand" />
                  <Box className="sf-timeline-badge blue">
                    <Building size={16} />
                  </Box>
                  <Box className="sf-timeline-body">
                    <Typography className="sf-timeline-title">
                      In-Store Purchase
                    </Typography>
                    <Typography className="sf-timeline-meta">
                      Subtotal: $73.29
                    </Typography>
                    <Typography className="sf-timeline-time">
                      January 31, 2022 • 12:42 PM EDT
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 2.5, pt: 1.5, borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
                <Button
                  size="small"
                  variant="text"
                  sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 700, color: "#0176D3" }}
                  onClick={() => {
                    if (showSnackbar) showSnackbar("Loaded 6 additional timeline records", "info");
                  }}
                >
                  Show more...
                </Button>
              </Box>
            </Card>
          </Box>
        </Box>
      )}

      {/* ── TAB CONTENT: Edit Profile ──────────────────────────────────────────────── */}
      {subTab === "edit" && (
        <Card className="sf-card">
          <Box className="sf-card-header">
            <Typography className="sf-card-title">
              <User size={18} color="#0176D3" /> Profile Information & Work Details
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update your corporate identification details, phone number, and territory assignment visible across customer records.
          </Typography>

          {profileSuccess && <Alert severity="success" sx={{ mb: 3 }}>{profileSuccess}</Alert>}
          {profileError && <Alert severity="error" sx={{ mb: 3 }}>{profileError}</Alert>}

          <form onSubmit={handleSaveProfile}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
              <TextField
                label="First Name"
                required
                value={profileForm.first_name}
                onChange={handleProfileChange("first_name")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><User size={16} /></InputAdornment>,
                }}
              />
              <TextField
                label="Last Name"
                required
                value={profileForm.last_name}
                onChange={handleProfileChange("last_name")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><User size={16} /></InputAdornment>,
                }}
              />
              <TextField
                label="Corporate Email Address"
                type="email"
                required
                value={profileForm.email}
                onChange={handleProfileChange("email")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment>,
                }}
              />
              <TextField
                label="Direct Phone Number"
                value={profileForm.phone}
                onChange={handleProfileChange("phone")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment>,
                }}
              />
              <TextField
                label="Job Title"
                value={profileForm.title}
                onChange={handleProfileChange("title")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Briefcase size={16} /></InputAdornment>,
                }}
              />
              <TextField
                label="Assigned Department"
                value={profileForm.department}
                onChange={handleProfileChange("department")}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Building size={16} /></InputAdornment>,
                }}
              />
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                <TextField
                  label="Primary Location / Regional HQ"
                  value={profileForm.location}
                  onChange={handleProfileChange("location")}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><MapPin size={16} /></InputAdornment>,
                  }}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                <TextField
                  label="Professional Bio & Focus"
                  multiline
                  rows={3}
                  value={profileForm.bio}
                  onChange={handleProfileChange("bio")}
                  placeholder="Short summary of roles, territories, and accounts managed..."
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 2, borderTop: "1px solid var(--color-border)" }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  setProfileForm({
                    first_name: user?.first_name || "",
                    last_name: user?.last_name || "",
                    email: user?.email || "",
                    phone: "+1 (555) 234-5678",
                    title: "Senior Account Executive",
                    department: "Enterprise Cloud Division",
                    location: "San Francisco, CA (HQ)",
                    bio: "Focused on enterprise cloud solutions.",
                  });
                  setProfileSuccess("");
                }}
              >
                Reset
              </Button>
              <Button type="submit" variant="contained" startIcon={<Check size={16} />}>
                Save Changes
              </Button>
            </Box>
          </form>
        </Card>
      )}

      {/* ── TAB CONTENT: Security & 2FA ────────────────────────────────────────────── */}
      {subTab === "security" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Card className="sf-card">
            <Box className="sf-card-header">
              <Typography className="sf-card-title">
                <KeyRound size={18} color="#0176D3" /> Change Password
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Ensure your account is protected with an enterprise-strength password containing at least 8 characters.
            </Typography>

            {passwordSuccess && <Alert severity="success" sx={{ mb: 2.5 }}>{passwordSuccess}</Alert>}
            {passwordError && <Alert severity="error" sx={{ mb: 2.5 }}>{passwordError}</Alert>}

            <form onSubmit={handlePasswordSubmit}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2 }}>
                <TextField
                  label="Current Password"
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><KeyRound size={16} /></InputAdornment>,
                  }}
                />
                <Box sx={{ display: { xs: "none", sm: "block" } }} />
                <TextField
                  label="New Password"
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><KeyRound size={16} /></InputAdornment>,
                  }}
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><KeyRound size={16} /></InputAdornment>,
                  }}
                />
              </Box>

              {passwordForm.newPassword && (
                <Box sx={{ mb: 3, maxWidth: 400 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Password Strength</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: pwdScore >= 75 ? "success.main" : pwdScore >= 50 ? "warning.main" : "error.main" }}>
                      {pwdScore >= 75 ? "Strong" : pwdScore >= 50 ? "Medium" : "Weak"}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pwdScore}
                    color={pwdScore >= 75 ? "success" : pwdScore >= 50 ? "warning" : "error"}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" variant="contained" disabled={passwordLoading}>
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </Box>
            </form>
          </Card>

          <Card className="sf-card">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography className="sf-card-title" sx={{ mb: 0.5 }}>
                  <Shield size={18} color="#0176D3" /> Multi-Factor Authentication (MFA / 2FA)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add hardware keys or authenticator apps (Google Authenticator, Okta Verify, 1Password) for maximum security.
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.twoFactorEnabled}
                    onChange={(e) => {
                      setPreferences({ ...preferences, twoFactorEnabled: e.target.checked });
                      if (showSnackbar) showSnackbar(e.target.checked ? "2FA enabled" : "2FA disabled", "info");
                    }}
                    color="primary"
                  />
                }
                label={preferences.twoFactorEnabled ? "2FA Active" : "2FA Disabled"}
              />
            </Box>
          </Card>

          <Card className="sf-card">
            <Typography className="sf-card-title" sx={{ mb: 1 }}>
              <Laptop size={18} color="#0176D3" /> Active Authorized Logins & Sessions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Devices and IP locations actively connected to this Cirrus CRM account.
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Device / Browser</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Laptop size={16} /> Chrome 122 (Windows 11)
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'IBM Plex Mono', monospace" }}>192.168.1.45</TableCell>
                  <TableCell>San Francisco, CA, US</TableCell>
                  <TableCell><Chip label="Active Now" size="small" color="success" sx={{ height: 20 }} /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Smartphone size={16} /> Safari Mobile (iOS 17)
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'IBM Plex Mono', monospace" }}>172.56.21.9</TableCell>
                  <TableCell>San Jose, CA, US</TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">Yesterday 18:22</Typography></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </Box>
      )}

      {/* ── TAB CONTENT: Preferences & Schedule ─────────────────────────────────────── */}
      {subTab === "preferences" && (
        <Card className="sf-card">
          <Box className="sf-card-header">
            <Typography className="sf-card-title">
              <Clock size={18} color="#0176D3" /> Regional & Working Hours Preferences
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure calendar availability, regional timezones, and your default outbound email signature.
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
            <TextField
              label="Primary Timezone"
              value={preferences.timezone}
              onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Globe size={16} /></InputAdornment>,
              }}
            />
            <TextField
              label="Date Display Format"
              value={preferences.dateFormat}
              onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Calendar size={16} /></InputAdornment>,
              }}
            />
            <TextField
              label="Business Hours (Start)"
              type="time"
              value={preferences.workStart}
              onChange={(e) => setPreferences({ ...preferences, workStart: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Clock size={16} /></InputAdornment>,
              }}
            />
            <TextField
              label="Business Hours (End)"
              type="time"
              value={preferences.workEnd}
              onChange={(e) => setPreferences({ ...preferences, workEnd: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Clock size={16} /></InputAdornment>,
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Outbound Email Signature</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
              Automatically appended when emailing contacts and leads directly from deal records.
            </Typography>
            <TextField
              multiline
              rows={4}
              value={preferences.emailSignature}
              onChange={(e) => setPreferences({ ...preferences, emailSignature: e.target.value })}
              sx={{ fontFamily: "'IBM Plex Mono', monospace" }}
            />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={() => {
                if (showSnackbar) showSnackbar("Preferences and schedule saved successfully!", "success");
              }}
            >
              Save Preferences
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
}
