import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, Button,
  Switch, FormControlLabel, Alert, Divider, Chip,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  Building2, Sliders, Palette, Share2, Database, Shield,
  Check, Save, RefreshCw, Download, Moon, Sun, Lock,
  ChevronRight, Laptop, Sparkles, CheckCircle2, AlertTriangle,
  ExternalLink, Key, Zap
} from "lucide-react";
import { useThemeMode } from "../context/ThemeModeProvider";
import { useSnackbar } from "../context/SnackbarContext";

// Clean vector brand icons
function GoogleWorkspaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#E01E5A" d="M6 15a2.5 2.5 0 1 0-2.5-2.5V15H6zm0 1H1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h5a2.5 2.5 0 0 0 0-5.001z" />
      <path fill="#36C5F0" d="M9 6a2.5 2.5 0 1 0 2.5-2.5H9V6zm-1 0V1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a2.5 2.5 0 0 0 5.001 0z" />
      <path fill="#2EB67D" d="M18 9a2.5 2.5 0 1 0 2.5 2.5V9H18zm0-1h5a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-5a2.5 2.5 0 0 0 0 5.001z" />
      <path fill="#ECB22E" d="M15 18a2.5 2.5 0 1 0-2.5 2.5V18H15zm1 0v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5a2.5 2.5 0 0 0-5.001 0z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" rx="1" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" rx="1" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" rx="1" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" rx="1" />
    </svg>
  );
}

function StripeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="5" fill="#635BFF" />
      <path fill="#FFFFFF" d="M13.9 10.3c0-.9-.7-1.3-1.8-1.3-1.6 0-3.6.5-5.1 1.4V6.8c1.7-.8 3.5-1.1 5.2-1.1 4.2 0 6.9 2.1 6.9 5.8 0 5.7-7.8 4.7-7.8 7.2 0 1.1 1 1.5 2.3 1.5 1.9 0 4.1-.7 5.7-1.7v3.7c-1.8.9-3.9 1.3-5.8 1.3-4.4 0-7.3-2.1-7.3-5.9 0-6.1 7.9-5 7.9-7.3z" />
    </svg>
  );
}

export default function Settings() {
  const { mode, toggleMode } = useThemeMode();
  const { showSnackbar } = useSnackbar ? useSnackbar() : { showSnackbar: () => {} };

  // Subtab: "general" | "pipeline" | "appearance" | "integrations" | "security" | "data"
  const [activeTab, setActiveTab] = useState("general");
  const [savedAlert, setSavedAlert] = useState("");

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
          timezone: "Eastern Time (US & Canada) (UTC-04:00)",
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
  const [appearance, setAppearance] = useState({
    density: "standard",
    defaultLanding: "/",
    showTips: true,
  });

  // Integrations state
  const [integrations, setIntegrations] = useState([
    {
      id: "google",
      name: "Google Workspace",
      desc: "Sync Google Calendar events, contacts, and Gmail correspondence into customer activity timelines.",
      connected: true,
      iconComponent: <GoogleWorkspaceIcon />,
    },
    {
      id: "slack",
      name: "Slack",
      desc: "Broadcast Closed-Won deals, urgent lead alerts, and approval requests into designated channels.",
      connected: true,
      iconComponent: <SlackIcon />,
    },
    {
      id: "microsoft",
      name: "Microsoft 365",
      desc: "Integrate Outlook mail threads, Microsoft Teams meetings, and enterprise calendar appointments.",
      connected: false,
      iconComponent: <MicrosoftIcon />,
    },
    {
      id: "stripe",
      name: "Stripe Billing",
      desc: "Import subscription invoices, MRR/ARR contract values, and automated payment receipts.",
      connected: false,
      iconComponent: <StripeIcon />,
    },
  ]);

  // Security configuration
  const [security, setSecurity] = useState({
    enforce2FA: true,
    sessionTimeoutHours: 8,
    passwordExpirationDays: 90,
  });

  const handleGeneralSave = (e) => {
    e.preventDefault();
    localStorage.setItem("crm_general_settings", JSON.stringify(general));
    setSavedAlert("Settings saved successfully!");
    if (showSnackbar) showSnackbar("Settings updated successfully", "success");
    setTimeout(() => setSavedAlert(""), 3000);
  };

  const toggleIntegration = (id) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.connected;
          if (showSnackbar) {
            showSnackbar(`${item.name} ${next ? "connected" : "disconnected"}`, next ? "success" : "info");
          }
          return { ...item, connected: next };
        }
        return item;
      })
    );
  };

  const exportData = (type) => {
    const filename = `cirrus_${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    const dummyContent = `id,name,created_at\n1,Sample ${type},${new Date().toISOString()}`;
    const blob = new Blob([dummyContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showSnackbar) showSnackbar(`Exported ${type} records to ${filename}`, "success");
  };

  const tabs = [
    { id: "general", label: "Organization", icon: <Building2 size={16} /> },
    { id: "pipeline", label: "Pipeline & Quotas", icon: <Sliders size={16} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
    { id: "integrations", label: "Integrations", icon: <Share2 size={16} /> },
    { id: "security", label: "Security & 2FA", icon: <Shield size={16} /> },
    { id: "data", label: "Data Export", icon: <Database size={16} /> },
  ];

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto", pb: 6 }}>
      {/* ── Page Header matching Dashboard prototype (Image 2) ── */}
      <Box sx={{ mb: 3 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 22, sm: 26 },
            fontWeight: 800,
            color: "text.primary",
            letterSpacing: "-0.02em",
          }}
        >
          Settings & Workspace
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
          Manage your organization profile, pipeline automation rules, external integrations, and security policies.
        </Typography>
      </Box>

      {/* ── Tabs Bar (Clean pro tab row) ── */}
      <Box
        sx={{
          display: "flex",
          borderBottom: "1px solid",
          borderColor: "divider",
          mb: 3.5,
          gap: { xs: 2, sm: 3.5 },
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                pb: 1.5,
                cursor: "pointer",
                position: "relative",
                fontSize: 13.5,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "primary.main" : "text.secondary",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
                "&:after": isActive
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: "2.5px",
                      bgcolor: "primary.main",
                      borderRadius: "2px",
                    }
                  : {},
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Box>
          );
        })}
      </Box>

      {savedAlert && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px", fontSize: 13 }}>
          {savedAlert}
        </Alert>
      )}

      {/* ── Tab: Organization & General ── */}
      {activeTab === "general" && (
        <Card sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
                Company Information
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.25 }}>
                Visible on quotes, customer invoices, and user invites.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleGeneralSave} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>
                    Organization Legal Name
                  </Typography>
                  <input
                    type="text"
                    value={general.orgName}
                    onChange={(e) => setGeneral({ ...general, orgName: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      fontSize: 14,
                      backgroundColor: "var(--color-surface, #FFFFFF)",
                      color: "inherit",
                      fontFamily: "inherit",
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>
                    Website URL
                  </Typography>
                  <input
                    type="url"
                    value={general.website}
                    onChange={(e) => setGeneral({ ...general, website: e.target.value })}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      fontSize: 14,
                      backgroundColor: "var(--color-surface, #FFFFFF)",
                      color: "inherit",
                      fontFamily: "inherit",
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>
                    Primary Support Email
                  </Typography>
                  <input
                    type="email"
                    value={general.supportEmail}
                    onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      fontSize: 14,
                      backgroundColor: "var(--color-surface, #FFFFFF)",
                      color: "inherit",
                      fontFamily: "inherit",
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>
                    Phone Number
                  </Typography>
                  <input
                    type="text"
                    value={general.phone}
                    onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      fontSize: 14,
                      backgroundColor: "var(--color-surface, #FFFFFF)",
                      color: "inherit",
                      fontFamily: "inherit",
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>
                    Default Currency
                  </Typography>
                  <select
                    value={general.currency}
                    onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      fontSize: 14,
                      backgroundColor: "var(--color-surface, #FFFFFF)",
                      color: "inherit",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                    <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                  </select>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", mb: 0.75 }}>
                    Fiscal Year Start
                  </Typography>
                  <select
                    value={general.fiscalYearStart}
                    onChange={(e) => setGeneral({ ...general, fiscalYearStart: e.target.value })}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border, #CBD5E1)",
                      fontSize: 14,
                      backgroundColor: "var(--color-surface, #FFFFFF)",
                      color: "inherit",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="January">January</option>
                    <option value="April">April</option>
                    <option value="July">July</option>
                    <option value="October">October</option>
                  </select>
                </Box>
              </Box>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save size={16} />}
                  sx={{
                    bgcolor: "primary.main",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    borderRadius: "8px",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  Save Organization Settings
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      )}

      {/* ── Tab: Pipeline & Quotas ── */}
      {activeTab === "pipeline" && (
        <Card sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
              Sales Pipeline Automation Rules
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 3 }}>
              Configure automatic deal warnings, inactivity periods, and quarterly quota targets.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
                    Stalled Deal Decay Warning
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    Flag deals in red when no activity has been logged for this many days.
                  </Typography>
                </Box>
                <input
                  type="number"
                  min="3"
                  max="90"
                  value={pipelineConfig.decayDays}
                  onChange={(e) => setPipelineConfig({ ...pipelineConfig, decayDays: Number(e.target.value) })}
                  style={{
                    width: 80,
                    height: 38,
                    textAlign: "center",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border, #CBD5E1)",
                    fontSize: 14,
                    fontWeight: 700,
                    backgroundColor: "var(--color-surface, #FFFFFF)",
                    color: "inherit",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
                    Require Win / Loss Justification Reason
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    Reps must select a reason category when closing deals won or lost.
                  </Typography>
                </Box>
                <Switch
                  checked={pipelineConfig.requireCloseReason}
                  onChange={(e) => setPipelineConfig({ ...pipelineConfig, requireCloseReason: e.target.checked })}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
                    Team Quarterly Revenue Quota ($)
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    Target revenue benchmark displayed on manager executive dashboards.
                  </Typography>
                </Box>
                <input
                  type="number"
                  step="50000"
                  value={pipelineConfig.teamQuarterlyQuota}
                  onChange={(e) => setPipelineConfig({ ...pipelineConfig, teamQuarterlyQuota: Number(e.target.value) })}
                  style={{
                    width: 140,
                    height: 38,
                    textAlign: "right",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border, #CBD5E1)",
                    fontSize: 14,
                    fontWeight: 700,
                    backgroundColor: "var(--color-surface, #FFFFFF)",
                    color: "inherit",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (showSnackbar) showSnackbar("Pipeline rules saved", "success");
                  }}
                  sx={{ bgcolor: "primary.main", textTransform: "none", fontWeight: 700 }}
                >
                  Save Pipeline Rules
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      )}

      {/* ── Tab: Appearance ── */}
      {activeTab === "appearance" && (
        <Card sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
              Theme & Interface Preferences
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 3 }}>
              Customize your visual theme and table layout density.
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 3, mb: 3 }}>
              {/* Light Mode Option */}
              <Box
                onClick={() => mode !== "light" && toggleMode()}
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  border: "2px solid",
                  borderColor: mode === "light" ? "primary.main" : "divider",
                  bgcolor: "#FFFFFF",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Sun size={24} color="#F59E0B" />
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>
                      Light Mode
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                      Clean, high contrast daylight aesthetic
                    </Typography>
                  </Box>
                </Box>
                {mode === "light" && <CheckCircle2 size={20} color="#0C5A75" />}
              </Box>

              {/* Dark Mode Option */}
              <Box
                onClick={() => mode !== "dark" && toggleMode()}
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  border: "2px solid",
                  borderColor: mode === "dark" ? "primary.main" : "divider",
                  bgcolor: "#1E293B",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Moon size={24} color="#818CF8" />
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>
                      Dark Mode
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                      Sleek midnight palette for low-light work
                    </Typography>
                  </Box>
                </Box>
                {mode === "dark" && <CheckCircle2 size={20} color="#38BDF8" />}
              </Box>
            </Box>
          </Box>
        </Card>
      )}

      {/* ── Tab: Integrations ── */}
      {activeTab === "integrations" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
              Connected Apps & Ecosystem
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.25 }}>
              Seamlessly sync communication, email threads, video calls, and billing events.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2.5 }}>
            {integrations.map((app) => (
              <Card
                key={app.id}
                sx={{
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "divider",
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: "8px", bgcolor: "action.hover", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {app.iconComponent}
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>
                        {app.name}
                      </Typography>
                    </Box>

                    {app.connected ? (
                      <Chip
                        label="Connected"
                        size="small"
                        sx={{ bgcolor: "#ECFDF5", color: "#065F46", fontWeight: 700, fontSize: 11, height: 22 }}
                      />
                    ) : (
                      <Chip
                        label="Available"
                        size="small"
                        sx={{ bgcolor: "action.hover", color: "text.secondary", fontWeight: 600, fontSize: 11, height: 22 }}
                      />
                    )}
                  </Box>

                  <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5, mb: 2.5 }}>
                    {app.desc}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {app.connected ? "Active sync every 5 min" : "One-click OAuth 2.0"}
                  </Typography>

                  <Button
                    size="small"
                    variant={app.connected ? "outlined" : "contained"}
                    color={app.connected ? "error" : "primary"}
                    onClick={() => toggleIntegration(app.id)}
                    sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600, borderRadius: "6px" }}
                  >
                    {app.connected ? "Disconnect" : "Connect"}
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* ── Tab: Security & 2FA ── */}
      {activeTab === "security" && (
        <Card sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
              Security & Access Policies
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 3 }}>
              Protect sensitive deal data and enforce enterprise security compliance.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
                    Enforce Two-Factor Authentication (2FA)
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    Require all team members to authenticate via Google Authenticator or SMS.
                  </Typography>
                </Box>
                <Switch
                  checked={security.enforce2FA}
                  onChange={(e) => setSecurity({ ...security, enforce2FA: e.target.checked })}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
                    Session Idle Inactivity Timeout (Hours)
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    Automatically log out dormant browser sessions.
                  </Typography>
                </Box>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={security.sessionTimeoutHours}
                  onChange={(e) => setSecurity({ ...security, sessionTimeoutHours: Number(e.target.value) })}
                  style={{
                    width: 80,
                    height: 38,
                    textAlign: "center",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border, #CBD5E1)",
                    fontSize: 14,
                    fontWeight: 700,
                    backgroundColor: "var(--color-surface, #FFFFFF)",
                    color: "inherit",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (showSnackbar) showSnackbar("Security policies updated", "success");
                  }}
                  sx={{ bgcolor: "primary.main", textTransform: "none", fontWeight: 700 }}
                >
                  Save Security Policies
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      )}

      {/* ── Tab: Data Export ── */}
      {activeTab === "data" && (
        <Card sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
              Data Export & Compliance Backups
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 3 }}>
              Download complete comma-separated CSV archives of all records in your CRM workspace.
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5 }}>
              <Box sx={{ p: 2.5, borderRadius: "10px", border: "1px solid", borderColor: "divider", textAlign: "center" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                  Accounts & Companies
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
                  All accounts, industry tags, and parent links.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download size={14} />}
                  onClick={() => exportData("accounts")}
                  sx={{ textTransform: "none", fontSize: 12, fontWeight: 600 }}
                >
                  Export CSV
                </Button>
              </Box>

              <Box sx={{ p: 2.5, borderRadius: "10px", border: "1px solid", borderColor: "divider", textAlign: "center" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                  Contacts & Leads
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
                  Phone numbers, emails, and lead scores.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download size={14} />}
                  onClick={() => exportData("contacts")}
                  sx={{ textTransform: "none", fontSize: 12, fontWeight: 600 }}
                >
                  Export CSV
                </Button>
              </Box>

              <Box sx={{ p: 2.5, borderRadius: "10px", border: "1px solid", borderColor: "divider", textAlign: "center" }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                  Deals & Opportunities
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 2 }}>
                  Pipeline amounts, stages, and close dates.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download size={14} />}
                  onClick={() => exportData("opportunities")}
                  sx={{ textTransform: "none", fontSize: 12, fontWeight: 600 }}
                >
                  Export CSV
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
}
