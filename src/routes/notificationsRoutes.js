import express from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { isValidId } from "../utils/policies.js";
import { checkAndCreateTaskReminders } from "../services/reminderService.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/notifications  -- list current user's notifications
router.get("/", async (req, res) => {
  try {
    const unreadOnly = req.query.unread === "true";
    let query = `
      SELECT n.*, a.subject AS activity_subject, a.status AS activity_status
      FROM crm.notifications n
      LEFT JOIN crm.activities a ON a.activity_id = n.activity_id
      WHERE n.user_id = $1
    `;
    const params = [req.user.user_id];

    if (unreadOnly) {
      query += ` AND n.is_read = FALSE`;
    }

    query += ` ORDER BY n.created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET /api/notifications/unread-count  -- get count of unread notifications for badges
router.get("/unread-count", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::INT AS unread_count
       FROM crm.notifications
       WHERE user_id = $1 AND is_read = FALSE`,
      [req.user.user_id]
    );
    res.json({ unread_count: result.rows[0].unread_count || 0 });
  } catch (err) {
    console.error("Failed to count unread notifications:", err);
    res.status(500).json({ error: "Failed to count unread notifications" });
  }
});

// PATCH /api/notifications/:id/read  -- mark single notification as read
router.patch("/:id/read", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid notification id" });
  }

  try {
    const result = await pool.query(
      `UPDATE crm.notifications
       SET is_read = TRUE, read_at = now(), updated_at = now()
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// PATCH /api/notifications/read-all  -- mark all unread notifications as read
router.patch("/read-all", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE crm.notifications
       SET is_read = TRUE, read_at = now(), updated_at = now()
       WHERE user_id = $1 AND is_read = FALSE
       RETURNING notification_id`,
      [req.user.user_id]
    );

    res.json({ updated_count: result.rows.length });
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// DELETE /api/notifications/:id  -- delete a notification
router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid notification id" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM crm.notifications
       WHERE notification_id = $1 AND user_id = $2
       RETURNING notification_id`,
      [req.params.id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("Failed to delete notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// POST /api/notifications/run-reminders  -- manually trigger reminder generator (Admin/Manager or cron webhook)
router.post("/run-reminders", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ error: "Only admins and managers can manually trigger reminders" });
  }

  try {
    const summary = await checkAndCreateTaskReminders();
    res.json({ message: "Reminder check completed successfully", summary });
  } catch (err) {
    console.error("Manual reminder check failed:", err);
    res.status(500).json({ error: "Failed to process task reminders" });
  }
});

export default router;
