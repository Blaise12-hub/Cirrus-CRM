import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Button, Chip,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Switch, FormControlLabel, Divider, Tooltip
} from "@mui/material";
import {
  Bell, CheckCheck, Trash2, Check, ArrowRight,
  TrendingUp, UserPlus, Clock, AlertTriangle, Settings,
  Sparkles, ShieldCheck, ChevronRight, ChevronDown,
  Activity, ShoppingCart, UserCheck, Flame, Atom,
  Mail, ExternalLink, Calendar, Smartphone
} from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";
import { useSnackbar } from "../context/SnackbarContext";

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
    clearAll,
  } = useNotifications();
  const { showSnackbar } = useSnackbar ? useSnackbar() : { showSnackbar: () => {} };

  const [activeTab, setActiveTab] = useState("all");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [dismissedActions, setDismissedActions] = useState([]);
  const [prefs, setPrefs] = useState({
    dealsWon: true,
    leadAssigned: true,
    tasksDue: true,
    pastDueDeals: true,
    emailDigest: true,
    soundAlerts: true,
  });

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "deals":
        return notifications.filter((n) => n.type === "deal_won" || n.type === "deal_alert");
      case "leads":
        return notifications.filter((n) => n.type === "lead_assigned");
      case "activities":
        return notifications.filter((n) => n.type === "activity_due" || n.type === "system");
      default:
        return notifications;
    }
  };

  const filtered = getFilteredNotifications();

  // Helper to format relative or short time in EDT format matching template
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
      if (diffMin < 1) return "Just now • EDT";
      if (diffMin < 60) return `${diffMin}m ago • EDT`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago • EDT`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays === 1) return "Yesterday • EDT";
      return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} • EDT`;
    } catch {
      return "Recently";
    }
  };

  const getTimelineBadge = (type) => {
    switch (type) {
      case "deal_won":
        return { badgeClass: "green", icon: <TrendingUp size={16} />, label: "Closed Won" };
      case "lead_assigned":
        return { badgeClass: "teal", icon: <UserPlus size={16} />, label: "Lead Assigned" };
      case "deal_alert":
        return { badgeClass: "orange", icon: <AlertTriangle size={16} />, label: "Stalled Deal" };
      case "activity_due":
        return { badgeClass: "blue", icon: <Clock size={16} />, label: "Task Follow-up" };
      default:
        return { badgeClass: "purple", icon: <Sparkles size={16} />, label: "System Intelligence" };
    }
  };

  return (
    <Box className="view fade-in-up" sx={{ pb: 4 }}>
      {/* ── Salesforce-Style Object Header & Highlights Panel ───────────────────────── */}
      <Box sx={{ mb: 2 }}>
        {/* Breadcrumb row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, fontSize: 12, color: "text.secondary" }}>
          <span>Home</span>
          <ChevronRight size={14} />
          <span>Activity & Signals</span>
          <ChevronRight size={14} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "primary.main" }}>
            Notification Center & Alerts
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
                <Bell size={26} color="#4A9EFF" />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 22 }, letterSpacing: "-0.01em" }}>
                    Notification Center
                  </Typography>
                  {unreadCount > 0 ? (
                    <Chip
                      label={`${unreadCount} Unread Actions`}
                      size="small"
                      sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: "#FDEDEC", color: "#B3261E" }}
                    />
                  ) : (
                    <Chip
                      label="All Caught Up"
                      size="small"
                      sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: "#E3F3E9", color: "#2E7D46" }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 12.5 }}>
                  Real-time pipeline alerts, automated lead routing, and customer outreach reminders.
                </Typography>
              </Box>
            </Box>

            {/* Quick Action buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CheckCheck size={14} />}
                  onClick={() => {
                    markAllAsRead();
                    if (showSnackbar) showSnackbar("All notifications marked as read", "success");
                  }}
                  sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600 }}
                >
                  Mark all as read
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                startIcon={<Settings size={14} />}
                onClick={() => setPrefsOpen(true)}
                sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 600 }}
              >
                Preferences
              </Button>
              {notifications.length > 0 && (
                <Tooltip title="Clear all notifications">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      clearAll();
                      if (showSnackbar) showSnackbar("Notification feed cleared", "info");
                    }}
                    sx={{ border: "1px solid var(--color-border)", borderRadius: "6px" }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Tooltip>
              )}
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
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Total Notifications</Typography>
              <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, mt: 0.25 }}>
                {notifications.length} Records
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Unread Alerts</Typography>
              <Typography sx={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, color: unreadCount > 0 ? "error.main" : "text.secondary", mt: 0.25 }}>
                {unreadCount} Pending
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Delivery Channels</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "success.main", mt: 0.25 }}>
                In-App + Email Active
              </Typography>
            </Box>
            <Box>
              <Typography className="sf-card-subtitle" sx={{ fontSize: 10 }}>Signal Health</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: "primary.main", mt: 0.25 }}>
                100% Operational
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* ── Sub Navigation Filter Tabs (Matches Pro Template) ─────────────────────────── */}
      <Box className="sf-subnav">
        <button
          className={`sf-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <Bell size={15} />
          All Signals ({notifications.length})
        </button>
        <button
          className={`sf-tab ${activeTab === "unread" ? "active" : ""}`}
          onClick={() => setActiveTab("unread")}
        >
          <Activity size={15} />
          Unread ({unreadCount})
        </button>
        <button
          className={`sf-tab ${activeTab === "deals" ? "active" : ""}`}
          onClick={() => setActiveTab("deals")}
        >
          <TrendingUp size={15} />
          Deals & Revenue
        </button>
        <button
          className={`sf-tab ${activeTab === "leads" ? "active" : ""}`}
          onClick={() => setActiveTab("leads")}
        >
          <UserPlus size={15} />
          Inbound Leads
        </button>
        <button
          className={`sf-tab ${activeTab === "activities" ? "active" : ""}`}
          onClick={() => setActiveTab("activities")}
        >
          <Clock size={15} />
          Tasks & System
        </button>
      </Box>

      {/* ── Main Pro 2-Column Layout (Stream + Next Best Actions & Patterns) ─────────── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
        gap: 2.5,
        alignItems: "start"
      }}>
        {/* ── LEFT PANE: Engagement Feed of Notifications (Matches Pro Template) ─────── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Card className="sf-card">
            <Box className="sf-card-header" sx={{ mb: 2 }}>
              <Typography className="sf-card-title">
                <Activity size={18} color="#0176D3" /> Notification & Signal Stream
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                Showing {filtered.length} of {notifications.length}
              </Typography>
            </Box>

            {filtered.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                <Bell size={36} style={{ opacity: 0.3, margin: "0 auto 12px auto" }} />
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>No notifications in this view</Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeTab === "unread" ? "You're all caught up! No pending alerts." : "Try selecting 'All Signals' to view historical events."}
                </Typography>
              </Box>
            ) : (
              <Box className="sf-timeline">
                {filtered.map((item) => {
                  const { badgeClass, icon, label } = getTimelineBadge(item.type);
                  return (
                    <Box key={item.id} className="sf-timeline-row">
                      <ChevronRight size={14} className="sf-timeline-expand" />
                      <Box className={`sf-timeline-badge ${badgeClass}`}>
                        {icon}
                      </Box>
                      <Box className="sf-timeline-body">
                        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
                          <Typography
                            className="sf-timeline-title"
                            onClick={() => {
                              markAsRead(item.id);
                              if (item.link) navigate(item.link);
                            }}
                          >
                            {item.title}
                          </Typography>
                          {!item.read && (
                            <Chip
                              label="New"
                              size="small"
                              sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: "#E8F2FD", color: "#0176D3" }}
                            />
                          )}
                        </Box>
                        <Typography className="sf-timeline-meta">
                          {item.description}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.75, flexWrap: "wrap", gap: 1 }}>
                          <Typography className="sf-timeline-time">
                            {formatTime(item.timestamp)} • <span style={{ color: "#0176D3", fontWeight: 600 }}>{label}</span>
                          </Typography>

                          {/* Quick Actions */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {item.link && (
                              <button
                                className="sf-action-btn-secondary"
                                style={{ padding: "2px 6px", fontSize: 11.5 }}
                                onClick={() => {
                                  markAsRead(item.id);
                                  navigate(item.link);
                                }}
                              >
                                View Record →
                              </button>
                            )}
                            <button
                              className="sf-action-btn-secondary"
                              style={{ padding: "2px 6px", fontSize: 11.5, color: "var(--color-text-muted)" }}
                              onClick={() => (item.read ? markAsUnread(item.id) : markAsRead(item.id))}
                            >
                              {item.read ? "Mark unread" : "Mark read"}
                            </button>
                            <button
                              className="sf-action-btn-secondary"
                              style={{ padding: "2px 6px", fontSize: 11.5, color: "#B3261E" }}
                              onClick={() => dismissNotification(item.id)}
                            >
                              Dismiss
                            </button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {filtered.length > 0 && (
              <Box sx={{ mt: 2.5, pt: 1.5, borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
                <Button
                  size="small"
                  variant="text"
                  sx={{ textTransform: "none", fontSize: 12.5, fontWeight: 700, color: "#0176D3" }}
                  onClick={() => {
                    if (showSnackbar) showSnackbar("All notification signals synchronized", "info");
                  }}
                >
                  Show more...
                </Button>
              </Box>
            )}
          </Card>
        </Box>

        {/* ── RIGHT PANE: Next Best Actions & Patterns (Matches Pro Template) ───────── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Card 1: Next Best Actions (Exact match from reference template) */}
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

            {!dismissedActions.includes(1) && (
              <Box className="sf-next-action-row" sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box className="sf-action-icon-ring">
                    <Sparkles size={16} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Review Stalled Enterprise Deal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Apex Global Cloud ($140,000) hasn't had activity in 16 days.
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
                      navigate("/pipeline");
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
                    <Activity size={16} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Route 4 Inbound Leads
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      New enterprise submissions waiting in unassigned lead queue.
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
                      navigate("/leads");
                      setDismissedActions([...dismissedActions, 2]);
                    }}
                  >
                    Take Action
                  </button>
                </Box>
              </Box>
            )}
          </Card>

          {/* Card 2: Signal Patterns (Heatmap & Histogram from template) */}
          <Card className="sf-card">
            <Box className="sf-card-header">
              <Typography className="sf-card-title">
                Engagement & Signal Patterns
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
                Days of Week Signal Density
              </Typography>
              <Box className="sf-heatmap-grid" sx={{ mt: 1, mb: 2 }}>
                {[
                  { day: "Su", bg: "#C6DBF5" },
                  { day: "M", bg: "#8CB9F0" },
                  { day: "T", bg: "#4E97EB" },
                  { day: "W", bg: "#1D78E2" },
                  { day: "Th", bg: "#015BB5" },
                  { day: "F", bg: "#0176D3" },
                  { day: "Sa", bg: "#C6DBF5" },
                ].map((item, idx) => (
                  <Box key={idx} className="sf-heatmap-cell">
                    <Typography className="sf-heatmap-day">{item.day}</Typography>
                    <Box className="sf-heatmap-block" sx={{ bgcolor: item.bg }} />
                  </Box>
                ))}
              </Box>

              <Typography variant="caption" sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
                Times of Day Alert Distribution
              </Typography>
              <Box className="sf-histogram-grid" sx={{ mt: 1 }}>
                {[
                  { time: "12a", h: "12%", muted: true },
                  { time: "", h: "8%", muted: true },
                  { time: "4a", h: "15%", muted: true },
                  { time: "", h: "25%", muted: true },
                  { time: "8a", h: "60%", muted: true },
                  { time: "", h: "75%", muted: false },
                  { time: "12p", h: "90%", muted: false },
                  { time: "", h: "80%", muted: false },
                  { time: "4p", h: "50%", muted: true },
                  { time: "", h: "35%", muted: true },
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
          </Card>
        </Box>
      </Box>

      {/* ── Preferences Modal ──────────────────────────────────────────────────────── */}
      <Dialog open={prefsOpen} onClose={() => setPrefsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Notification Preferences
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Control which triggers generate real-time alerts and executive digests.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "primary.main" }}>
              Deal & Pipeline Alerts
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.dealsWon}
                  onChange={(e) => setPrefs({ ...prefs, dealsWon: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Closed Won Celebrations</Typography>
                  <Typography variant="caption" color="text.secondary">Notify when an opportunity is marked Won by anyone on the team.</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.pastDueDeals}
                  onChange={(e) => setPrefs({ ...prefs, pastDueDeals: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Past-Due Deals Warning</Typography>
                  <Typography variant="caption" color="text.secondary">Alert when deals exceed their estimated closing target date.</Typography>
                </Box>
              }
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "primary.main" }}>
              Leads & Activities
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.leadAssigned}
                  onChange={(e) => setPrefs({ ...prefs, leadAssigned: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Lead Assignment Routing</Typography>
                  <Typography variant="caption" color="text.secondary">Instant notification when a new lead is assigned to you.</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.tasksDue}
                  onChange={(e) => setPrefs({ ...prefs, tasksDue: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Tasks & Follow-up Due Today</Typography>
                  <Typography variant="caption" color="text.secondary">Daily morning reminder of meetings, demos, and follow-ups.</Typography>
                </Box>
              }
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "primary.main" }}>
              Delivery Channels
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.emailDigest}
                  onChange={(e) => setPrefs({ ...prefs, emailDigest: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Daily Executive Email Digest</Typography>
                  <Typography variant="caption" color="text.secondary">Send summary of notifications to your registered email address.</Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setPrefsOpen(false);
              if (showSnackbar) showSnackbar("Notification preferences updated", "success");
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
