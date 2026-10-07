import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Switch, FormControlLabel, MenuItem, Alert, Divider,
  Chip, Paper, IconButton, Tooltip
} from "@mui/material";
import {
  Building, Sliders, Palette, Share2, Database, Check,
  Moon, Sun, Shield, Save, RefreshCw, Download, Bell,
  Workflow, ChevronRight, ChevronDown, Sparkles, Activity,
  Atom, CheckCircle2, AlertTriangle, ExternalLink, MoreVertical,
  Laptop, Server, Lock
} from "lucide-react";
import { useThemeMode } from "../context/ThemeModeProvider";
import { useSnackbar } from "../context/SnackbarContext";

// Professional vector brand icons
function GoogleWorkspaceIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path fill="#E01E5A" d="M6 15a2.5 2.5 0 1 0-2.5-2.5V15H6zm0 1H1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h5a2.5 2.5 0 0 0 0-5.001z" />
      <path fill="#36C5F0" d="M9 6a2.5 2.5 0 1 0 2.5-2.5H9V6zm-1 0V1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a2.5 2.5 0 0 0 5.001 0z" />
      <path fill="#2EB67D" d="M18 9a2.5 2.5 0 1 0 2.5 2.5V9H18zm0-1h5a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-5a2.5 2.5 0 0 0 0 5.001z" />
      <path fill="#ECB22E" d="M15 18a2.5 2.5 0 1 0-2.5 2.5V18H15zm1 0v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5a2.5 2.5 0 0 0-5.001 0z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" rx="1" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" rx="1" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" rx="1" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" rx="1" />
    </svg>
  );
}

function StripeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#635BFF" />
      <path fill="#FFFFFF" d="M13.9 10.3c0-.9-.7-1.3-1.8-1.3-1.6 0-3.6.5-5.1 1.4V6.8c1.7-.8 3.5-1.1 5.2-1.1 4.2 0 6.9 2.1 6.9 5.8 0 5.7-7.8 4.7-7.8 7.2 0 1.1 1 1.5 2.3 1.5 1.9 0 4.1-.7 5.7-1.7v3.7c-1.8.9-3.9 1.3-5.8 1.3-4.4 0-7.3-2.1-7.3-5.9 0-6.1 7.9-5 7.9-7.3z" />
    </svg>
  );
}

function ZapierIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#FF4F00" />
      <path fill="#FFFFFF" d="M13.2 4.5h-2.4v5.4H5.4v2.4h5.4v7.2h2.4v-7.2h5.4V9.9h-5.4V4.5z" />
      <path fill="#FFFFFF" transform="rotate(45 12 12)" d="M13.2 5.5h-2.4v5H5.8v2h5v6h2.4v-6h5v-2h-5v-5z" />
    </svg>
  );
}

export default function Settings() {
  const { mode, toggleMode } = useThemeMode();
  const { showSnackbar } = useSnackbar ? useSnackbar() : { showSnackbar: () => {} };
  const [subTab, setSubTab] = useState("general"); // "general" | "pipeline" | "appearance" | "integrations" | "data"

  // General settings state
  const [general, setGeneral] = useState(() => {
    const saved = localStorage.getItem("crm_general_settings");
    return saved
      ? JSON.parse(saved)
      : {
          orgName: "Cirrus Cloud Technologies, Inc.",
          website: "https://cirrus-crm.cloud",
          supportEmail: "support@cirrus-crm.cloud",
          phone: "+1 (800) 555-0199",
          currency: "USD ($)",
          fiscalYearStart: "January",
        };
  });

  // Pipeline configuration
  const [pipelineConfig, setPipelineConfig] = useState({
    decayDays: 14,
    autoCloseInactive: false,
    requireCloseReason: true,
    defaultCurrency: "USD",
    teamQuarterlyQuota: 1000000,
  });

  // Appearance configuration
  const [appearance, setAppearance] = useState(() => {
    return {
      density: "standard",
      defaultLanding: "/",
      showTips: true,
    };
  });

  // Integrations state
  const [integrations, setIntegrations] = useState([
    {
      id: "google",
      name: "Google Workspace",
      desc: "Sync Google Calendar events, contacts, and Gmail correspondence directly into customer timelines.",
      connected: true,
      iconComponent: <GoogleWorkspaceIcon />,
      borderAccent: "#4285F4",
    },
    {
      id: "slack",
      name: "Slack",
      desc: "Broadcast Closed-Won opportunities, hot lead alerts, and team approvals directly into Slack channels.",
      connected: true,
      iconComponent: <SlackIcon />,
      borderAccent: "#4A154B",
    },
    {
      id: "microsoft",
      name: "Microsoft 365",
      desc: "Integrate Outlook mail threads, Microsoft Teams meetings, and Outlook address books.",
      connected: false,
      iconComponent: <MicrosoftIcon />,
      borderAccent: "#00A4EF",
    },
    {
      id: "stripe",
      name: "Stripe Billing",
      desc: "Directly import subscription payments, invoices, and ARR data into account and deal records.",
      connected: false,
      iconComponent: <StripeIcon />,
      borderAccent: "#635BFF",
    },
    {
      id: "zapier",
      name: "Zapier & Webhooks",
      desc: "Trigger automated multi-app workflows whenever leads, accounts, or deals are updated.",
      connected: true,
      iconComponent: <ZapierIcon />,
      borderAccent: "#FF4F00",
    },
  ]);

  const [dismissedActions, setDismissedActions] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState("");

  const handleGeneralSave = (e) => {
    e.preventDefault();
    localStorage.setItem("crm_general_settings", JSON.stringify(general));
    setSavedSuccess("Organization settings saved successfully!");
    if (showSnackbar) showSnackbar("Organization settings saved", "success");
    setTimeout(() => setSavedSuccess(""), 3500);
  };

  const toggleIntegration = (id) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.connected;
          if (showSnackbar) {
            showSnackbar(`${item.name} ${next ? "connected" : "disconnected"} successfully`, next ? "success" : "info");
          }
          return { ...item, connected: next };
        }
        return item;
      })
    );
  };

  return (
    <Box className="view fade-in-up" sx={{ pb: 4 }}>
      {/* ── Salesforce-Style Setup Header & Highlights Panel ───────────────────────── */}
      <Box sx={{ mb: 2 }}>
        {/* Breadcrumbs */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, fontSize: 12, color: "text.secondary" }}>
          <span>Setup</span>
          <ChevronRight size={14} />
          <span>Company Settings</span>
          <ChevronRight size={14} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "primary.main" }}>
            Organization & System Controls
          </Typography>
        </Box>

        {/* Highlights panel */}
        <Card sx={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden" }}>
          <Box sx={{ p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "8px",
                  bgcolor: "#002050",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,32,80,0.2)",
                  flexShrink: 0,
                }}
              >
                <Building size={28} color="#4A9EFF" />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 22 }, letterSpacing: "-0.01em" }}>
                    {general.orgName}
                  </Typography>
                  <Chip
                    label="Enterprise Cloud v4.2"
                    size="small"
                    sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: "#E8F2FD", color: "#0176D3" }}
                  />
                  <Chip
                    label="System Healthy"
                    size="small"
                    sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: "#E3F3E9", color: "#2E7D46" }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 12.5 }}>
                  Primary Domain: {general.website} • Currency: {general.currency} • Fiscal Start: {general.fiscalYearStart}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleGeneralSave}
                startIcon={<Save size={14} />}
                sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600 }}
              >
                Save All Changes
              </Button>
            </Box>
          </Box>

          {/* Highlights strip */}
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
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Instance Tier</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 13, mt: 0.25 }}>
                Multi-Tenant Cloud
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Active Rep Seats</Typography>
              <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, color: "primary.main", mt: 0.25 }}>
                24 of 50 Licensed
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Data Region</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 13, mt: 0.25 }}>
                US-West (Oregon)
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>API Health & Rate</Typography>
              <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, color: "success.main", mt: 0.25 }}>
                99.98% (0 throttled)
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* ── Sub Navigation Tabs (Matches Pro Template) ─────────────────────────────────── */}
      <Box className="sf-subnav">
        <button
          className={`sf-tab ${subTab === "general" ? "active" : ""}`}
          onClick={() => setSubTab("general")}
        >
          <Building size={15} />
          Company & Organization
        </button>
        <button
          className={`sf-tab ${subTab === "pipeline" ? "active" : ""}`}
          onClick={() => setSubTab("pipeline")}
        >
          <Sliders size={15} />
          Pipeline & Decay Rules
        </button>
        <button
          className={`sf-tab ${subTab === "appearance" ? "active" : ""}`}
          onClick={() => setSubTab("appearance")}
        >
          <Palette size={15} />
          Appearance & Density
        </button>
        <button
          className={`sf-tab ${subTab === "integrations" ? "active" : ""}`}
          onClick={() => setSubTab("integrations")}
        >
          <Share2 size={15} />
          Connected Ecosystem ({integrations.filter(i => i.connected).length})
        </button>
        <button
          className={`sf-tab ${subTab === "data" ? "active" : ""}`}
          onClick={() => setSubTab("data")}
        >
          <Database size={15} />
          Data & Compliance
        </button>
      </Box>

      {savedSuccess && <Alert severity="success" sx={{ mb: 2.5 }}>{savedSuccess}</Alert>}

      {/* ── Main Layout: 2-Column (Main Config + Right Feed & Actions) ──────────────── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
        gap: 2.5,
        alignItems: "start"
      }}>
        {/* ── LEFT PANE: Active Configuration Panel ────────────────────────────────── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* TAB: General & Company */}
          {subTab === "general" && (
            <Card className="sf-card">
              <Box className="sf-card-header">
                <Typography className="sf-card-title">
                  <Building size={18} color="#0176D3" /> Company Profile & Global Parameters
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Branding information and regional parameters applied globally across invoices, customer portals, and export reports.
              </Typography>

              <form onSubmit={handleGeneralSave}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
                  <TextField
                    label="Organization Name"
                    required
                    value={general.orgName}
                    onChange={(e) => setGeneral({ ...general, orgName: e.target.value })}
                  />
                  <TextField
                    label="Company Domain Website"
                    value={general.website}
                    onChange={(e) => setGeneral({ ...general, website: e.target.value })}
                  />
                  <TextField
                    label="Support / Helpdesk Email"
                    type="email"
                    value={general.supportEmail}
                    onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                  />
                  <TextField
                    label="Primary Telephone Number"
                    value={general.phone}
                    onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                  />
                  <TextField
                    select
                    label="Default System Currency"
                    value={general.currency}
                    onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                  >
                    <MenuItem value="USD ($)">USD ($) - United States Dollar</MenuItem>
                    <MenuItem value="EUR (€)">EUR (€) - Euro</MenuItem>
                    <MenuItem value="GBP (£)">GBP (£) - British Pound</MenuItem>
                    <MenuItem value="CAD ($)">CAD ($) - Canadian Dollar</MenuItem>
                    <MenuItem value="AUD ($)">AUD ($) - Australian Dollar</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Fiscal Year Begins In"
                    value={general.fiscalYearStart}
                    onChange={(e) => setGeneral({ ...general, fiscalYearStart: e.target.value })}
                  >
                    <MenuItem value="January">January (Standard Calendar)</MenuItem>
                    <MenuItem value="April">April</MenuItem>
                    <MenuItem value="July">July</MenuItem>
                    <MenuItem value="October">October</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2, borderTop: "1px solid var(--color-border)" }}>
                  <Button type="submit" variant="contained" startIcon={<Save size={16} />}>
                    Save Organization Settings
                  </Button>
                </Box>
              </form>
            </Card>
          )}

          {/* TAB: Pipeline & Decay Rules */}
          {subTab === "pipeline" && (
            <Card className="sf-card">
              <Box className="sf-card-header">
                <Typography className="sf-card-title">
                  <Sliders size={18} color="#0176D3" /> Pipeline Velocity & Stale Deal Automation
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure automated warnings for stalled opportunities, required closed-lost criteria, and quota targets.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    label="Stale Deal Decay Warning (Days)"
                    type="number"
                    helperText="Highlight opportunities with no logged activities after this number of days"
                    value={pipelineConfig.decayDays}
                    onChange={(e) => setPipelineConfig({ ...pipelineConfig, decayDays: Number(e.target.value) })}
                  />
                  <TextField
                    label="Team Quarterly Quota Benchmark ($)"
                    type="number"
                    helperText="Base target used for team performance velocity graphs"
                    value={pipelineConfig.teamQuarterlyQuota}
                    onChange={(e) => setPipelineConfig({ ...pipelineConfig, teamQuarterlyQuota: Number(e.target.value) })}
                  />
                </Box>

                <Divider />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={pipelineConfig.requireCloseReason}
                        onChange={(e) => setPipelineConfig({ ...pipelineConfig, requireCloseReason: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Enforce Loss Reason on Closed-Lost Deals</Typography>
                        <Typography variant="caption" color="text.secondary">Requires sales reps to select a structured loss reason (Pricing, Competitor, Budget) when closing lost.</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={pipelineConfig.autoCloseInactive}
                        onChange={(e) => setPipelineConfig({ ...pipelineConfig, autoCloseInactive: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Auto-flag Inactive Deals in Kanban Board</Typography>
                        <Typography variant="caption" color="text.secondary">Automatically append warning labels to opportunities untouched for over 30 days.</Typography>
                      </Box>
                    }
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2, borderTop: "1px solid var(--color-border)" }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (showSnackbar) showSnackbar("Pipeline automation rules updated successfully", "success");
                  }}
                >
                  Save Pipeline Rules
                </Button>
              </Box>
            </Card>
          )}

          {/* TAB: Appearance & Density */}
          {subTab === "appearance" && (
            <Card className="sf-card">
              <Box className="sf-card-header">
                <Typography className="sf-card-title">
                  <Palette size={18} color="#0176D3" /> Theme & Interface Density
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Personalize your workspace aesthetic, dark mode, and interface density.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Theme Selector Cards */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box
                    onClick={() => { if (mode === "dark") toggleMode(); }}
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      border: "2px solid",
                      borderColor: mode === "light" ? "#0176D3" : "var(--color-border)",
                      bgcolor: "#FFFFFF",
                      color: "#1A1A1A",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: mode === "light" ? "0 2px 8px rgba(1,118,211,0.2)" : "none",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Sun size={18} color="#0176D3" />
                        <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>Enterprise Classic Light</Typography>
                      </Box>
                      {mode === "light" && <Chip label="Active" size="small" color="primary" sx={{ height: 18, fontSize: 9.5 }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      Crisp white surfaces with classic Salesforce blue accents.
                    </Typography>
                  </Box>

                  <Box
                    onClick={() => { if (mode === "light") toggleMode(); }}
                    sx={{
                      p: 2,
                      borderRadius: "8px",
                      border: "2px solid",
                      borderColor: mode === "dark" ? "#4A9EFF" : "var(--color-border)",
                      bgcolor: "#1D2029",
                      color: "#EDEDEF",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: mode === "dark" ? "0 2px 8px rgba(74,158,255,0.2)" : "none",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Moon size={18} color="#4A9EFF" />
                        <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>Midnight Dark Console</Typography>
                      </Box>
                      {mode === "dark" && <Chip label="Active" size="small" sx={{ height: 18, fontSize: 9.5, bgcolor: "#4A9EFF", color: "#000", fontWeight: 700 }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#9498A3" }}>
                      Low-glare dark workspace optimized for extended pipeline reviews.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    select
                    label="Table & Record Density"
                    value={appearance.density}
                    onChange={(e) => setAppearance({ ...appearance, density: e.target.value })}
                  >
                    <MenuItem value="compact">Compact (Maximum records per view)</MenuItem>
                    <MenuItem value="standard">Standard (Balanced enterprise spacing)</MenuItem>
                    <MenuItem value="comfortable">Comfortable (High padding)</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Default Landing Page on Login"
                    value={appearance.defaultLanding}
                    onChange={(e) => setAppearance({ ...appearance, defaultLanding: e.target.value })}
                  >
                    <MenuItem value="/">Rep Home Dashboard</MenuItem>
                    <MenuItem value="/pipeline">Deal Pipeline (Kanban)</MenuItem>
                    <MenuItem value="/leads">Leads Queue</MenuItem>
                    <MenuItem value="/accounts">Accounts Directory</MenuItem>
                  </TextField>
                </Box>
              </Box>
            </Card>
          )}

          {/* TAB: Connected Ecosystem & Integrations */}
          {subTab === "integrations" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card className="sf-card">
                <Box className="sf-card-header">
                  <Typography className="sf-card-title">
                    <Share2 size={18} color="#0176D3" /> Connected Enterprise Cloud Apps
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Connect Cirrus CRM with external calendar sync, corporate email, Slack deal announcements, and Stripe ARR billing.
                </Typography>
              </Card>

              {integrations.map((app) => (
                <Card key={app.id} className="sf-card" sx={{ p: "16px 20px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "8px",
                          bgcolor: "background.paper",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid var(--color-border)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                          flexShrink: 0,
                        }}
                      >
                        {app.iconComponent}
                      </Box>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{app.name}</Typography>
                          <Chip
                            label={app.connected ? "Active & Synced" : "Disconnected"}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 10,
                              fontWeight: 700,
                              bgcolor: app.connected ? "#E3F3E9" : "action.hover",
                              color: app.connected ? "#2E7D46" : "text.secondary"
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, mt: 0.25 }}>
                          {app.desc}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      size="small"
                      variant={app.connected ? "outlined" : "contained"}
                      color={app.connected ? "inherit" : "primary"}
                      onClick={() => toggleIntegration(app.id)}
                      sx={{ textTransform: "none", fontSize: 12, fontWeight: 600 }}
                    >
                      {app.connected ? "Disconnect" : "Connect App"}
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          )}

          {/* TAB: Data & Backups */}
          {subTab === "data" && (
            <Card className="sf-card">
              <Box className="sf-card-header">
                <Typography className="sf-card-title">
                  <Database size={18} color="#0176D3" /> Data Governance, Compliance & Export
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate instant encrypted CSV exports of all accounts, deals, pipeline stages, and contact records.
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "8px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Export Accounts & Contacts</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Comprehensive CSV of all company accounts, direct emails, phone numbers, and addresses.
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<Download size={14} />}>
                    Export Accounts (CSV)
                  </Button>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "8px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Export Deals & Pipeline History</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Full export of closed won, lost, and active opportunities with revenue values and stage velocity.
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<Download size={14} />}>
                    Export Deals (CSV)
                  </Button>
                </Paper>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "error.main", mb: 0.5 }}>
                  System Cache & Preferences Reset
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  Clears local browser cache, resets demo notifications, and restores default dashboard filters.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset cached preferences?")) {
                      localStorage.removeItem("crm_notifications");
                      localStorage.removeItem("crm_general_settings");
                      window.location.reload();
                    }
                  }}
                >
                  Reset Cached Preferences
                </Button>
              </Box>
            </Card>
          )}
        </Box>

        {/* ── RIGHT COLUMN: Next Best Actions & System Audit Stream (Pro Template) ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Next Best Actions Card (Matches Template) */}
          <Card className="sf-next-action">
            <Box className="sf-next-action-header">
              <Box className="sf-next-action-title">
                <Atom size={20} color="#0176D3" />
                Setup Recommendations
              </Box>
              <IconButton size="small">
                <ChevronDown size={16} />
              </IconButton>
            </Box>

            {!dismissedActions.includes(1) && (
              <Box className="sf-next-action-row" sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box className="sf-action-icon-ring">
                    <Sparkles size={16} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Enable Calendar Auto-Sync
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sync client meetings from Google Workspace automatically.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <button
                    className="sf-action-btn-secondary"
                    onClick={() => setDismissedActions([...dismissedActions, 1])}
                  >
                    Not Helpful
                  </button>
                  <button
                    className="sf-action-btn-primary"
                    onClick={() => {
                      setSubTab("integrations");
                      setDismissedActions([...dismissedActions, 1]);
                    }}
                  >
                    Take Action
                  </button>
                </Box>
              </Box>
            )}

            {!dismissedActions.includes(2) && (
              <Box className="sf-next-action-row">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box className="sf-action-icon-ring" sx={{ borderColor: "#0176D3", color: "#0176D3" }}>
                    <Shield size={16} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Enforce Mandatory 2FA
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Require all 24 licensed sales reps to utilize MFA before Q4 close.
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <button
                    className="sf-action-btn-secondary"
                    onClick={() => setDismissedActions([...dismissedActions, 2])}
                  >
                    Not Helpful
                  </button>
                  <button
                    className="sf-action-btn-primary"
                    onClick={() => {
                      if (showSnackbar) showSnackbar("Enforced mandatory 2FA across all sales reps", "success");
                      setDismissedActions([...dismissedActions, 2]);
                    }}
                  >
                    Take Action
                  </button>
                </Box>
              </Box>
            )}
          </Card>

          {/* System Audit Timeline Feed (Matches Template Engagement Feed) */}
          <Card className="sf-card">
            <Box className="sf-card-header" sx={{ mb: 2 }}>
              <Typography className="sf-card-title" sx={{ fontSize: 14 }}>
                <Activity size={18} color="#0176D3" /> System Audit Stream
              </Typography>
            </Box>

            <Box className="sf-timeline">
              <Box className="sf-timeline-row">
                <ChevronRight size={14} className="sf-timeline-expand" />
                <Box className="sf-timeline-badge green">
                  <Check size={16} />
                </Box>
                <Box className="sf-timeline-body">
                  <Typography className="sf-timeline-title">
                    Zapier Webhook Verified
                  </Typography>
                  <Typography className="sf-timeline-meta">
                    Event: Lead.Created → Outbound Trigger
                  </Typography>
                  <Typography className="sf-timeline-time">
                    Today • 11:42 AM EDT
                  </Typography>
                </Box>
              </Box>

              <Box className="sf-timeline-row">
                <ChevronRight size={14} className="sf-timeline-expand" />
                <Box className="sf-timeline-badge teal">
                  <Building size={16} />
                </Box>
                <Box className="sf-timeline-body">
                  <Typography className="sf-timeline-title">
                    Organization Settings Updated
                  </Typography>
                  <Typography className="sf-timeline-meta">
                    Currency set to USD ($)
                  </Typography>
                  <Typography className="sf-timeline-time">
                    Today • 09:15 AM EDT
                  </Typography>
                </Box>
              </Box>

              <Box className="sf-timeline-row">
                <ChevronRight size={14} className="sf-timeline-expand" />
                <Box className="sf-timeline-badge orange">
                  <Shield size={16} />
                </Box>
                <Box className="sf-timeline-body">
                  <Typography className="sf-timeline-title">
                    Security Policy Snapshot
                  </Typography>
                  <Typography className="sf-timeline-meta">
                    Status: All 24 Active Reps Compliant
                  </Typography>
                  <Typography className="sf-timeline-time">
                    Yesterday • 04:30 PM EDT
                  </Typography>
                </Box>
              </Box>

              <Box className="sf-timeline-row">
                <ChevronRight size={14} className="sf-timeline-expand" />
                <Box className="sf-timeline-badge blue">
                  <Share2 size={16} />
                </Box>
                <Box className="sf-timeline-body">
                  <Typography className="sf-timeline-title">
                    Slack Bot OAuth Token Refreshed
                  </Typography>
                  <Typography className="sf-timeline-meta">
                    Channel: #deals-enterprise-won
                  </Typography>
                  <Typography className="sf-timeline-time">
                    Oct 2, 2026 • 02:18 PM EDT
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
                  if (showSnackbar) showSnackbar("All system audit logs up to date", "info");
                }}
              >
                Show more...
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
