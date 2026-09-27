import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { opportunitiesApi, leadsApi, dashboardApi } from "../api/resources";
import { api } from "../api/client";

const NotificationsContext = createContext(null);

const DEFAULT_FALLBACK_NOTIFICATIONS = [
  {
    id: "system-welcome",
    title: "Cirrus CRM Online",
    description: "Connected to live API backend. Real-time deal and pipeline monitoring is active.",
    type: "system",
    link: "/pipeline",
    read: false,
    timestamp: new Date().toISOString(),
  },
];

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("crm_notifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_FALLBACK_NOTIFICATIONS;
  });

  const [loading, setLoading] = useState(false);

  // Sync notifications from backend records
  const syncWithBackend = useCallback(async () => {
    // Read state map from localStorage (maps id -> boolean)
    let readMap = {};
    let dismissedIds = new Set();
    try {
      const savedRead = localStorage.getItem("crm_notifs_read_map");
      if (savedRead) readMap = JSON.parse(savedRead);
      const savedDismissed = localStorage.getItem("crm_notifs_dismissed");
      if (savedDismissed) dismissedIds = new Set(JSON.parse(savedDismissed));
    } catch {
      // ignore
    }

    try {
      // 1. Check if backend has a dedicated /notifications route
      let backendNotifs = null;
      try {
        backendNotifs = await api.get("/notifications");
      } catch {
        // Backend doesn't have dedicated /notifications route yet — fall through to synthesis
      }

      if (Array.isArray(backendNotifs) && backendNotifs.length > 0) {
        const processed = backendNotifs
          .filter((n) => !dismissedIds.has(String(n.id || n.notification_id)))
          .map((n) => ({
            id: String(n.id || n.notification_id),
            title: n.title,
            description: n.message || n.description,
            type: n.type || "system",
            link: n.link || "/pipeline",
            read: readMap[String(n.id || n.notification_id)] ?? !!n.is_read,
            timestamp: n.created_at || n.timestamp || new Date().toISOString(),
          }));
        setNotifications(processed);
        return;
      }

      // 2. Derive notifications dynamically from live backend resources
      const [summaryRes, oppsRes, leadsRes] = await Promise.allSettled([
        dashboardApi.summary(),
        opportunitiesApi.list(),
        leadsApi.list(),
      ]);

      const liveList = [];

      // A. Opportunities from backend
      if (oppsRes.status === "fulfilled" && Array.isArray(oppsRes.value)) {
        const opps = oppsRes.value;

        // Won deals
        const wonDeals = opps.filter((o) => o.stage === "won");
        wonDeals.slice(0, 3).forEach((deal) => {
          const id = `deal-won-${deal.opportunity_id}`;
          if (!dismissedIds.has(id)) {
            liveList.push({
              id,
              title: "Opportunity Closed Won!",
              description: `"${deal.name}" was successfully closed for $${Number(deal.amount || 0).toLocaleString()}.`,
              type: "deal_won",
              link: `/opportunities/${deal.opportunity_id}`,
              read: !!readMap[id],
              timestamp: deal.updated_at || deal.created_at || new Date(Date.now() - 3600000).toISOString(),
            });
          }
        });

        // Past-due open deals
        const now = new Date();
        const pastDueDeals = opps.filter((o) => {
          if (o.stage === "won" || o.stage === "lost" || !o.close_date) return false;
          return new Date(o.close_date) < now;
        });

        pastDueDeals.slice(0, 3).forEach((deal) => {
          const id = `deal-overdue-${deal.opportunity_id}`;
          if (!dismissedIds.has(id)) {
            liveList.push({
              id,
              title: "Deal Past Expected Close Date",
              description: `"${deal.name}" ($${Number(deal.amount || 0).toLocaleString()}) requires target date update or stage adjustment.`,
              type: "deal_alert",
              link: `/opportunities/${deal.opportunity_id}`,
              read: !!readMap[id],
              timestamp: deal.close_date,
            });
          }
        });
      }

      // B. Leads from backend
      if (leadsRes.status === "fulfilled" && Array.isArray(leadsRes.value)) {
        const newLeads = leadsRes.value.filter((l) => l.status === "new");
        newLeads.slice(0, 3).forEach((lead) => {
          const id = `lead-new-${lead.lead_id}`;
          if (!dismissedIds.has(id)) {
            liveList.push({
              id,
              title: "New Lead in Queue",
              description: `${lead.first_name} ${lead.last_name} (${lead.company_name || "New Company"}) is awaiting qualification.`,
              type: "lead_assigned",
              link: "/leads",
              read: !!readMap[id],
              timestamp: lead.created_at || new Date().toISOString(),
            });
          }
        });
      }

      // C. Activity Load from dashboard summary
      if (summaryRes.status === "fulfilled" && summaryRes.value) {
        const summary = summaryRes.value;
        const dueToday = summary.activity_load?.due_today || 0;
        const overdue = summary.activity_load?.overdue || 0;

        if (overdue > 0) {
          const id = "act-overdue-alert";
          if (!dismissedIds.has(id)) {
            liveList.push({
              id,
              title: "Overdue Sales Activities",
              description: `You have ${overdue} tasks or customer follow-ups past their due dates.`,
              type: "activity_due",
              link: "/contacts",
              read: !!readMap[id],
              timestamp: new Date().toISOString(),
            });
          }
        } else if (dueToday > 0) {
          const id = "act-today-alert";
          if (!dismissedIds.has(id)) {
            liveList.push({
              id,
              title: "Activities Scheduled for Today",
              description: `You have ${dueToday} customer activities and demos scheduled for today.`,
              type: "activity_due",
              link: "/contacts",
              read: !!readMap[id],
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      // Always include a system status notification
      const systemId = "sys-status-active";
      if (!dismissedIds.has(systemId)) {
        liveList.push({
          id: systemId,
          title: "Cirrus CRM Cloud Active",
          description: "Database synchronization, email webhooks, and sales metrics are running normally.",
          type: "system",
          link: "/pipeline",
          read: !!readMap[systemId],
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        });
      }

      // Sort by newest timestamp
      liveList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (liveList.length > 0) {
        setNotifications(liveList);
      }
    } catch (err) {
      console.warn("Failed to synchronize notifications with backend:", err);
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
    // Poll backend every 60 seconds for updates
    const interval = setInterval(syncWithBackend, 60000);
    return () => clearInterval(interval);
  }, [syncWithBackend]);

  useEffect(() => {
    localStorage.setItem("crm_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      // Save read map
      const readMap = {};
      next.forEach((n) => {
        if (n.read) readMap[n.id] = true;
      });
      localStorage.setItem("crm_notifs_read_map", JSON.stringify(readMap));
      return next;
    });
  };

  const markAsUnread = (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: false } : n));
      const readMap = {};
      next.forEach((n) => {
        if (n.read) readMap[n.id] = true;
      });
      localStorage.setItem("crm_notifs_read_map", JSON.stringify(readMap));
      return next;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      const readMap = {};
      next.forEach((n) => {
        readMap[n.id] = true;
      });
      localStorage.setItem("crm_notifs_read_map", JSON.stringify(readMap));
      return next;
    });
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      try {
        const savedDismissed = localStorage.getItem("crm_notifs_dismissed");
        const dismissed = savedDismissed ? JSON.parse(savedDismissed) : [];
        if (!dismissed.includes(id)) dismissed.push(id);
        localStorage.setItem("crm_notifs_dismissed", JSON.stringify(dismissed));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem("crm_notifs_dismissed", JSON.stringify(allIds));
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        dismissNotification,
        clearAll,
        syncWithBackend,
        loading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}
