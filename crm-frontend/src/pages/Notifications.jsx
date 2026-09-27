import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Button, Chip,
  IconButton, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
  Divider, Tooltip
} from "@mui/material";
import {
  Bell, CheckCheck, Trash2, Check, ArrowRight,
  TrendingUp, UserPlus, Clock, AlertTriangle, Settings,
  Sparkles, ShieldCheck
} from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";

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

  const [activeTab, setActiveTab] = useState("all");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    dealsWon: true,
    leadAssigned: true,
    tasksDue: true,
    pastDueDeals: true,
    emailDigest: false,
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

  // Helper to format relative or short time
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "deal_won":
        return { icon: <TrendingUp size={18} />, color: "#2E7D46", bg: "rgba(46, 125, 70, 0.12)" };
      case "lead_assigned":
        return { icon: <UserPlus size={18} />, color: "#1160B7", bg: "rgba(17, 96, 183, 0.12)" };
      case "activity_due":
        return { icon: <Clock size={18} />, color: "#B25E09", bg: "rgba(178, 94, 9, 0.12)" };
      case "deal_alert":
        return { icon: <AlertTriangle size={18} />, color: "#B3261E", bg: "rgba(179, 38, 30, 0.12)" };
      default:
        return { icon: <Sparkles size={18} />, color: "#5E7CE2", bg: "rgba(94, 124, 226, 0.12)" };
    }
  };

  return (
    <Box className="view" sx={{ pb: 3 }}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
              Notification Center
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} New`}
                size="small"
                color="error"
                sx={{ height: 22, fontSize: 11, fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Real-time updates on pipeline changes, deals, leads, and operational activities.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {unreadCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<CheckCheck size={14} />}
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<Settings size={14} />}
            onClick={() => setPrefsOpen(true)}
          >
            Preferences
          </Button>
          {notifications.length > 0 && (
            <Tooltip title="Clear all notifications">
              <IconButton size="small" color="error" onClick={clearAll} sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
                <Trash2 size={15} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Filter Tabs ───────────────────────────────────────── */}
      <Card sx={{ mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            px: 2,
            "& .MuiTab-root": {
              fontSize: 13,
              fontWeight: 600,
              textTransform: "none",
              minHeight: 48,
            },
          }}
        >
          <Tab value="all" label={`All (${notifications.length})`} />
          <Tab value="unread" label={`Unread (${unreadCount})`} />
          <Tab value="deals" label="Deals & Pipeline" />
          <Tab value="leads" label="Leads" />
          <Tab value="activities" label="Activities & System" />
        </Tabs>
      </Card>

      {/* ── Notifications List ────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <Bell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>No notifications found</Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === "unread" ? "You're all caught up! No unread notifications." : "There are no notifications in this category."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {filtered.map((item) => {
            const { icon, color, bg } = getIconForType(item.type);
            return (
              <Card
                key={item.id}
                sx={{
                  borderLeft: 4,
                  borderLeftColor: item.read ? "transparent" : "primary.main",
                  bgcolor: item.read ? "background.paper" : "action.hover",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: "14px 18px !important", display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      bgcolor: bg,
                      color: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    {icon}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.25 }}>
                      <Typography sx={{ fontWeight: item.read ? 600 : 700, fontSize: 13.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {formatTime(item.timestamp)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>
                      {item.description}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      {item.link && (
                        <Button
                          size="small"
                          variant="text"
                          endIcon={<ArrowRight size={12} />}
                          onClick={() => {
                            markAsRead(item.id);
                            navigate(item.link);
                          }}
                          sx={{ fontSize: 12, p: 0, minWidth: 0, fontWeight: 600 }}
                        >
                          View Details
                        </Button>
                      )}
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>•</Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => (item.read ? markAsUnread(item.id) : markAsRead(item.id))}
                        sx={{ fontSize: 12, p: 0, minWidth: 0, color: "text.secondary" }}
                      >
                        {item.read ? "Mark as unread" : "Mark as read"}
                      </Button>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>•</Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => dismissNotification(item.id)}
                        sx={{ fontSize: 12, p: 0, minWidth: 0, color: "text.secondary", "&:hover": { color: "error.main" } }}
                      >
                        Dismiss
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ── Preferences Dialog ────────────────────────────────── */}
      <Dialog open={prefsOpen} onClose={() => setPrefsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Notification Preferences
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Control which triggers generate notifications and how you wish to receive them.
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
          <Button onClick={() => setPrefsOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
