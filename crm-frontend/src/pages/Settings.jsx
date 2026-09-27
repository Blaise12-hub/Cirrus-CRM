import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Tabs, Tab, Switch, FormControlLabel, MenuItem,
  Alert, Divider, Chip, Paper
} from "@mui/material";
import {
  Building, Sliders, Palette, Share2, Database, Check,
  Moon, Sun, Shield, Save, RefreshCw, Download, Bell,
  Workflow
} from "lucide-react";
import { useThemeMode } from "../context/ThemeModeProvider";

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
  const [tabIndex, setTabIndex] = useState(0);

  // General settings
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

  // Integrations state with professional vector brand logos
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

  const [savedSuccess, setSavedSuccess] = useState("");

  const handleGeneralSave = (e) => {
    e.preventDefault();
    localStorage.setItem("crm_general_settings", JSON.stringify(general));
    setSavedSuccess("Organization settings saved successfully!");
    setTimeout(() => setSavedSuccess(""), 3500);
  };

  const toggleIntegration = (id) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, connected: !item.connected } : item))
    );
  };

  return (
    <Box className="view" sx={{ pb: 3 }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
            System Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Configure organization preferences, pipeline rules, themes, and external cloud integrations.
          </Typography>
        </Box>
      </Box>

      {/* ── Settings Tabs ─────────────────────────────────────── */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            "& .MuiTab-root": {
              fontSize: 13,
              fontWeight: 600,
              textTransform: "none",
              minHeight: 48,
              gap: 1,
            },
          }}
        >
          <Tab icon={<Building size={16} />} iconPosition="start" label="General & Organization" />
          <Tab icon={<Sliders size={16} />} iconPosition="start" label="Pipeline & Rules" />
          <Tab icon={<Palette size={16} />} iconPosition="start" label="Appearance & Theme" />
          <Tab icon={<Share2 size={16} />} iconPosition="start" label="Integrations & Apps" />
          <Tab icon={<Database size={16} />} iconPosition="start" label="Data & Backup" />
        </Tabs>
      </Card>

      {savedSuccess && <Alert severity="success" sx={{ mb: 3 }}>{savedSuccess}</Alert>}

      {/* ── TAB 0: General & Organization ─────────────────────── */}
      {tabIndex === 0 && (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Company Profile</Typography>
              <Typography variant="body2" color="text.secondary">
                Company branding and regional parameters applied globally across invoices and records.
              </Typography>
            </Box>

            <form onSubmit={handleGeneralSave}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
                <TextField
                  label="Organization Name"
                  required
                  value={general.orgName}
                  onChange={(e) => setGeneral({ ...general, orgName: e.target.value })}
                />
                <TextField
                  label="Company Website"
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
                  label="Primary Phone Number"
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

              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1, borderTop: 1, borderColor: "divider" }}>
                <Button type="submit" variant="contained" startIcon={<Save size={16} />}>
                  Save Organization Settings
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 1: Pipeline & Automation Rules ────────────────── */}
      {tabIndex === 1 && (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Sales Velocity & Decay Rules</Typography>
              <Typography variant="body2" color="text.secondary">
                Configure automated warnings for stalled opportunities and quota benchmarks.
              </Typography>
            </Box>

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
                  label="Team Quarterly Quota Benchmark"
                  type="number"
                  helperText="Base target used for team performance velocity graphs"
                  value={pipelineConfig.teamQuarterlyQuota}
                  onChange={(e) => setPipelineConfig({ ...pipelineConfig, teamQuarterlyQuota: Number(e.target.value) })}
                />
              </Box>

              <Divider />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
                      <Typography variant="caption" color="text.secondary">Requires reps to select a loss reason (Price, Competitor, Budget) when closing lost.</Typography>
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
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Auto-flag Inactive Deals</Typography>
                      <Typography variant="caption" color="text.secondary">Automatically append warning labels to opportunities untouched for over 30 days.</Typography>
                    </Box>
                  }
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1, borderTop: 1, borderColor: "divider" }}>
              <Button
                variant="contained"
                onClick={() => {
                  setSavedSuccess("Pipeline rules updated successfully!");
                  setTimeout(() => setSavedSuccess(""), 3000);
                }}
              >
                Save Pipeline Rules
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 2: Appearance & Theme ─────────────────────────── */}
      {tabIndex === 2 && (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Theme & Interface Customization</Typography>
              <Typography variant="body2" color="text.secondary">
                Personalize your workspace aesthetic, dark mode, and interface density.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Theme toggle row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      bgcolor: mode === "dark" ? "background.paper" : "#002050",
                      color: mode === "dark" ? "primary.main" : "#FFFFFF",
                    }}
                  >
                    {mode === "dark" ? <Moon size={22} /> : <Sun size={22} />}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Active Color Mode: {mode === "dark" ? "Dark Theme" : "Light Theme"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toggle between classic Salesforce enterprise light mode and dark workspace.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleMode}
                  startIcon={mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                >
                  Switch to {mode === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <TextField
                  select
                  label="Table & Record Density"
                  value={appearance.density}
                  onChange={(e) => setAppearance({ ...appearance, density: e.target.value })}
                >
                  <MenuItem value="compact">Compact (Maximum data per screen)</MenuItem>
                  <MenuItem value="standard">Standard (Default balanced view)</MenuItem>
                  <MenuItem value="comfortable">Comfortable (High padding)</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Default Login Landing Page"
                  value={appearance.defaultLanding}
                  onChange={(e) => setAppearance({ ...appearance, defaultLanding: e.target.value })}
                >
                  <MenuItem value="/">Home Dashboard</MenuItem>
                  <MenuItem value="/pipeline">Deal Pipeline</MenuItem>
                  <MenuItem value="/leads">Leads Queue</MenuItem>
                  <MenuItem value="/accounts">Accounts Directory</MenuItem>
                </TextField>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 3: Integrations & Cloud Apps ──────────────────── */}
      {tabIndex === 3 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Connected Enterprise Ecosystem</Typography>
            <Typography variant="body2" color="text.secondary">
              Connect Cirrus CRM with communication tools, payment gateways, and email providers.
            </Typography>
          </Box>

          {integrations.map((app) => (
            <Card key={app.id}>
              <CardContent sx={{ p: "18px !important", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: 1,
                      borderColor: "divider",
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
                        label={app.connected ? "Connected" : "Not Connected"}
                        size="small"
                        color={app.connected ? "success" : "default"}
                        variant={app.connected ? "filled" : "outlined"}
                        sx={{ height: 20, fontSize: 10.5, fontWeight: 600 }}
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
                >
                  {app.connected ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* ── TAB 4: Data & Backup ──────────────────────────────── */}
      {tabIndex === 4 && (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Data Export & Compliance</Typography>
              <Typography variant="body2" color="text.secondary">
                Generate full encrypted backups of your CRM accounts, contacts, deals, and activities.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Export Accounts & Contacts</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Download a full CSV of all company records, associated emails, phone numbers, and addresses.
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<Download size={14} />}>
                    Export Accounts (CSV)
                  </Button>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Export Deals & Pipeline History</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Comprehensive report of closed won, lost, and active opportunities with revenue values.
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<Download size={14} />}>
                    Export Deals (CSV)
                  </Button>
                </Paper>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "error.main", mb: 0.5 }}>
                  Local Storage & Cache Cleanup
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  Reset temporary client-side cached notifications and restore default settings.
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
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
