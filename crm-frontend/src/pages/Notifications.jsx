import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Button, Chip,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Switch, FormControlLabel, Divider, Tooltip,
  InputAdornment, Avatar
} from "@mui/material";
import {
  Bell, CheckCheck, Trash2, Check, ArrowRight,
  Search, Settings, MessageSquare, FileText, RefreshCw,
  ExternalLink, Clock, ShieldCheck, Filter, X, ChevronRight,
  TrendingUp, UserPlus, CheckCircle2, AlertCircle
} from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";
import { useSnackbar } from "../context/SnackbarContext";

// Initial seed mock items matching Image 3 prototype
const PROTOTYPE_SEED_ITEMS = [
  {
    id: "notif-proto-1",
    actor: "David McLaren",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    initials: "DM",
    statusColor: "#10B981", // online green dot
    actionText: "David McLaren left message in",
    targetText: "SGP project",
    category: "messages",
    timeAgo: "5 min ago",
    read: false,
    link: "/pipeline",
    detail: "Hey team, the client signed the revised master services agreement. Please review the updated scope before today's standup.",
  },
  {
    id: "notif-proto-2",
    actor: "Emily Davidson",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    initials: "ED",
    statusColor: "#F59E0B", // orange pending dot
    actionText: "Emily Davidson changed status in",
    targetText: "Legal support project",
    category: "status_change",
    timeAgo: "12 hours ago",
    read: false,
    link: "/pipeline",
    detail: "Opportunity stage moved from 'Proposal Review' to 'Contract Negotiation'. Legal team sign-off pending.",
  },
  {
    id: "notif-proto-3",
    actor: "SGP System",
    avatar: null,
    initials: "SGP",
    badgeBg: "#10B981",
    statusColor: "#10B981",
    actionText: "Status was changed in",
    targetText: "SGP project",
    category: "status_change",
    timeAgo: "1 day ago",
    read: true,
    link: "/pipeline",
    detail: "Automated workflow triggered: Phase 2 milestone completed with 100% test coverage.",
  },
  {
    id: "notif-proto-4",
    actor: "Legal Portal",
    avatar: null,
    initials: "LP",
    badgeBg: "#1E293B",
    statusColor: "#64748B",
    actionText: "Need to receive document in the",
    targetText: "Legal Support project",
    category: "requests",
    timeAgo: "2 days ago",
    read: true,
    link: "/pipeline",
    detail: "Counter-signed NDA and certificate of insurance required before proceeding to enterprise sandbox provisioning.",
  },
  {
    id: "notif-proto-5",
    actor: "David McLaren",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    initials: "DM",
    statusColor: "#10B981",
    actionText: "David McLaren left message in",
    targetText: "SGP project",
    category: "messages",
    timeAgo: "2 days ago",
    read: true,
    link: "/pipeline",
    detail: "Sent the final pipeline metrics summary to the VP of Sales. Looking great!",
  },
];

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

  // Prototype tabs: "all" | "messages" | "requests" | "status_change"
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [prefsOpen, setPrefsOpen] = useState(false);

  // Combine dynamic context notifications with prototype sample items for full richness
  const allNotifications = useMemo(() => {
    // Map context notifications into matching format
    const contextMapped = (notifications || []).map((n) => {
      let category = "status_change";
      let actionText = "Notification:";
      let targetText = n.title || "CRM Update";

      if (n.type === "deal_won") {
        category = "status_change";
        actionText = "Deal Closed Won:";
        targetText = n.title;
      } else if (n.type === "lead_assigned") {
        category = "requests";
        actionText = "New Lead Assigned:";
        targetText = n.title;
      } else if (n.type === "activity_due") {
        category = "requests";
        actionText = "Action required on";
        targetText = n.title;
      } else if (n.type === "system") {
        category = "messages";
        actionText = "System alert for";
        targetText = n.title;
      }

      return {
        id: n.id,
        actor: "Cirrus CRM",
        avatar: null,
        initials: "CRM",
        badgeBg: "#0C5A75",
        statusColor: "#0284C7",
        actionText,
        targetText,
        category,
        timeAgo: "Recently",
        read: !!n.read,
        link: n.link || "/pipeline",
        detail: n.description || n.title,
      };
    });

    // Merge: seed prototype items + dynamic context items, avoid duplicate IDs
    const seen = new Set();
    const merged = [];

    // Prioritize prototype items first as shown in Image 3
    PROTOTYPE_SEED_ITEMS.forEach((item) => {
      seen.add(item.id);
      merged.push(item);
    });

    contextMapped.forEach((item) => {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    });

    return merged;
  }, [notifications]);

  // Read status override tracking for local prototype items
  const [localReadState, setLocalReadState] = useState({});

  const handleToggleRead = (item) => {
    const isCurrentlyRead = localReadState[item.id] !== undefined ? localReadState[item.id] : item.read;
    const newStatus = !isCurrentlyRead;
    setLocalReadState((prev) => ({ ...prev, [item.id]: newStatus }));

    if (newStatus) {
      markAsRead(item.id);
      if (showSnackbar) showSnackbar("Marked as read", "info");
    } else {
      markAsUnread(item.id);
    }
  };

  const handleMarkAll = () => {
    const updated = {};
    allNotifications.forEach((n) => {
      updated[n.id] = true;
    });
    setLocalReadState(updated);
    markAllAsRead();
    if (showSnackbar) showSnackbar("All notifications marked as read", "success");
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((item) => {
      const isRead = localReadState[item.id] !== undefined ? localReadState[item.id] : item.read;
      if (onlyUnread && isRead) return false;

      // Category tab matching
      if (activeTab === "messages" && item.category !== "messages") return false;
      if (activeTab === "requests" && item.category !== "requests") return false;
      if (activeTab === "status_change" && item.category !== "status_change") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesActor = item.actor.toLowerCase().includes(q);
        const matchesAction = item.actionText.toLowerCase().includes(q);
        const matchesTarget = item.targetText.toLowerCase().includes(q);
        const matchesDetail = (item.detail || "").toLowerCase().includes(q);
        if (!matchesActor && !matchesAction && !matchesTarget && !matchesDetail) {
          return false;
        }
      }

      return true;
    });
  }, [allNotifications, activeTab, onlyUnread, searchQuery, localReadState]);

  // Compute active unread count for badge
  const currentUnreadCount = useMemo(() => {
    return allNotifications.filter((n) => {
      return localReadState[n.id] !== undefined ? !localReadState[n.id] : !n.read;
    }).length;
  }, [allNotifications, localReadState]);

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", pb: 5 }}>
      {/* ── Main Notifications Card matching Image 3 ── */}
      <Card
        sx={{
          bgcolor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        {/* Top Header Row (Image 3) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: { xs: 2.5, sm: "24px 32px 16px 32px" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 20, sm: 24 },
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.02em",
              }}
            >
              Notifications
            </Typography>
            {currentUnreadCount > 0 && (
              <Chip
                label={`${currentUnreadCount} new`}
                size="small"
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#1D4ED8",
                  fontWeight: 700,
                  fontSize: 11,
                  height: 22,
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="text"
              onClick={handleMarkAll}
              sx={{
                color: "#475569",
                fontSize: 13,
                fontWeight: 600,
                textTransform: "none",
                p: 0,
                minWidth: 0,
                "&:hover": {
                  color: "#0F172A",
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              Mark all as read
            </Button>

            <Tooltip title="Notification Settings">
              <IconButton
                size="small"
                onClick={() => setPrefsOpen(true)}
                sx={{
                  color: "#64748B",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  "&:hover": { bgcolor: "#EDF2F7", color: "#1E293B" },
                }}
              >
                <Settings size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tab Navigation Row matching Image 3 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: { xs: 2, sm: 4 },
            borderBottom: "1px solid #E2E8F0",
            gap: { xs: 2, sm: 4 },
            overflowX: "auto",
          }}
        >
          {/* All tab with badge */}
          <Box
            onClick={() => setActiveTab("all")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 1.5,
              cursor: "pointer",
              position: "relative",
              color: activeTab === "all" ? "#7C3AED" : "#64748B",
              fontWeight: activeTab === "all" ? 700 : 500,
              fontSize: 14,
              transition: "all 0.15s ease",
              "&:after": activeTab === "all" ? {
                content: '""',
                position: "absolute",
                bottom: -1,
                left: 0,
                right: 0,
                height: "2.5px",
                bgcolor: "#7C3AED",
                borderRadius: "2px",
              } : {},
            }}
          >
            <span>All</span>
            <Box
              sx={{
                bgcolor: activeTab === "all" ? "#EDE9FE" : "#F1F5F9",
                color: activeTab === "all" ? "#6D28D9" : "#64748B",
                fontSize: 11,
                fontWeight: 700,
                px: "7px",
                py: "1px",
                borderRadius: "10px",
                lineHeight: "16px",
              }}
            >
              {currentUnreadCount > 0 ? currentUnreadCount : allNotifications.length}
            </Box>
          </Box>

          {/* Messages tab */}
          <Box
            onClick={() => setActiveTab("messages")}
            sx={{
              py: 1.5,
              cursor: "pointer",
              position: "relative",
              color: activeTab === "messages" ? "#7C3AED" : "#64748B",
              fontWeight: activeTab === "messages" ? 700 : 500,
              fontSize: 14,
              transition: "all 0.15s ease",
              "&:after": activeTab === "messages" ? {
                content: '""',
                position: "absolute",
                bottom: -1,
                left: 0,
                right: 0,
                height: "2.5px",
                bgcolor: "#7C3AED",
                borderRadius: "2px",
              } : {},
            }}
          >
            Messages
          </Box>

          {/* Requests tab */}
          <Box
            onClick={() => setActiveTab("requests")}
            sx={{
              py: 1.5,
              cursor: "pointer",
              position: "relative",
              color: activeTab === "requests" ? "#7C3AED" : "#64748B",
              fontWeight: activeTab === "requests" ? 700 : 500,
              fontSize: 14,
              transition: "all 0.15s ease",
              "&:after": activeTab === "requests" ? {
                content: '""',
                position: "absolute",
                bottom: -1,
                left: 0,
                right: 0,
                height: "2.5px",
                bgcolor: "#7C3AED",
                borderRadius: "2px",
              } : {},
            }}
          >
            Requests
          </Box>

          {/* Status change tab */}
          <Box
            onClick={() => setActiveTab("status_change")}
            sx={{
              py: 1.5,
              cursor: "pointer",
              position: "relative",
              color: activeTab === "status_change" ? "#7C3AED" : "#64748B",
              fontWeight: activeTab === "status_change" ? 700 : 500,
              fontSize: 14,
              transition: "all 0.15s ease",
              "&:after": activeTab === "status_change" ? {
                content: '""',
                position: "absolute",
                bottom: -1,
                left: 0,
                right: 0,
                height: "2.5px",
                bgcolor: "#7C3AED",
                borderRadius: "2px",
              } : {},
            }}
          >
            Status change
          </Box>
        </Box>

        {/* Quick Search & Filter Toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 4 },
            py: 1.5,
            bgcolor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "8px",
              px: 1.5,
              py: "4px",
              flex: { xs: "1 1 100%", sm: "0 1 300px" },
            }}
          >
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Filter notifications…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: 13,
                fontFamily: "inherit",
                color: "#1E293B",
                background: "transparent",
              }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.25 }}>
                <X size={13} />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="button"
              type="button"
              onClick={() => setOnlyUnread(!onlyUnread)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: "5px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: onlyUnread ? "#7C3AED" : "#CBD5E1",
                bgcolor: onlyUnread ? "#F5F3FF" : "#FFFFFF",
                color: onlyUnread ? "#7C3AED" : "#475569",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <span>Unread only</span>
            </Box>
          </Box>
        </Box>

        {/* Notifications List (Image 3 layout) */}
        <Box sx={{ divideY: "1px solid #F1F5F9" }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  bgcolor: "#F1F5F9",
                  color: "#94A3B8",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                }}
              >
                <CheckCircle2 size={26} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1E293B" }}>
                All caught up!
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#64748B", mt: 0.5 }}>
                No notifications match your current filter settings.
              </Typography>
            </Box>
          ) : (
            filteredNotifications.map((item) => {
              const isRead = localReadState[item.id] !== undefined ? localReadState[item.id] : item.read;

              return (
                <Box
                  key={item.id}
                  onClick={() => setSelectedNotif(item)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: { xs: 2, sm: "18px 32px" },
                    bgcolor: isRead ? "#FFFFFF" : "#F6F8FD",
                    transition: "all 0.15s ease",
                    cursor: "pointer",
                    position: "relative",
                    "&:hover": {
                      bgcolor: isRead ? "#F8FAFC" : "#EDF2FE",
                    },
                  }}
                >
                  {/* Left: Avatar with Status Dot + Message Details */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                    {/* Avatar Container with bottom status dot */}
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      {item.avatar ? (
                        <Avatar
                          src={item.avatar}
                          alt={item.actor}
                          sx={{ width: 44, height: 44, border: "2px solid #FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            bgcolor: item.badgeBg || "#0C5A75",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 13,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                          }}
                        >
                          {item.initials || "CR"}
                        </Box>
                      )}

                      {/* Small status dot indicator on avatar (Image 3) */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          bgcolor: item.statusColor || "#10B981",
                          border: "2px solid #FFFFFF",
                        }}
                      />
                    </Box>

                    {/* Notification Text Lines matching Image 3 */}
                    <Box sx={{ minWidth: 0, flex: 1, pr: 2 }}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#1E293B",
                          fontWeight: isRead ? 500 : 600,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.actionText}{" "}
                        <Box
                          component="span"
                          sx={{
                            fontWeight: 700,
                            color: isRead ? "#0F172A" : "#6D28D9",
                          }}
                        >
                          {item.targetText}
                        </Box>
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 12.5,
                          color: "#64748B",
                          mt: 0.35,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <span>{item.timeAgo}</span>
                        {!isRead && (
                          <Box
                            component="span"
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: "#7C3AED",
                              display: "inline-block",
                            }}
                          />
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right Actions */}
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title={isRead ? "Mark as unread" : "Mark as read"}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleRead(item)}
                        sx={{
                          color: isRead ? "#94A3B8" : "#7C3AED",
                          bgcolor: isRead ? "transparent" : "#EDE9FE",
                          "&:hover": { bgcolor: "#E2E8F0" },
                        }}
                      >
                        <Check size={16} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Open in Pipeline / Detail">
                      <IconButton
                        size="small"
                        onClick={() => navigate(item.link || "/pipeline")}
                        sx={{
                          color: "#64748B",
                          "&:hover": { color: "#0F172A", bgcolor: "#E2E8F0" },
                        }}
                      >
                        <ExternalLink size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Card>

      {/* Detail Modal Preview */}
      <Dialog
        open={!!selectedNotif}
        onClose={() => setSelectedNotif(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        {selectedNotif && (
          <>
            <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: "#0F172A", pb: 1 }}>
              {selectedNotif.actionText} {selectedNotif.targetText}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar
                  src={selectedNotif.avatar}
                  sx={{ width: 36, height: 36, bgcolor: selectedNotif.badgeBg || "#0C5A75" }}
                >
                  {selectedNotif.initials}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
                    {selectedNotif.actor}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                    {selectedNotif.timeAgo} • In-App Notification
                  </Typography>
                </Box>
              </Box>

              <Card sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", p: 2 }}>
                <Typography sx={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                  {selectedNotif.detail}
                </Typography>
              </Card>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, display: "flex", justifyContent: "space-between" }}>
              <Button
                onClick={() => {
                  handleToggleRead(selectedNotif);
                  setSelectedNotif(null);
                }}
                sx={{ textTransform: "none", color: "#64748B" }}
              >
                Toggle Read
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedNotif(null);
                  navigate(selectedNotif.link || "/pipeline");
                }}
                sx={{
                  bgcolor: "#7C3AED",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#6D28D9" },
                }}
              >
                Go to Record
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Preferences Dialog */}
      <Dialog
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>
          Notification Preferences
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#7C3AED" } }} />}
              label={<Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>Closed Won Deal Alerts</Typography>}
            />
            <FormControlLabel
              control={<Switch defaultChecked sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#7C3AED" } }} />}
              label={<Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>New Lead Assignment Alerts</Typography>}
            />
            <FormControlLabel
              control={<Switch defaultChecked sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#7C3AED" } }} />}
              label={<Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>Project Messages & Mentions</Typography>}
            />
            <FormControlLabel
              control={<Switch defaultChecked sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#7C3AED" } }} />}
              label={<Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>Email Daily Digest</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPrefsOpen(false)} variant="contained" sx={{ bgcolor: "#7C3AED", textTransform: "none" }}>
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
