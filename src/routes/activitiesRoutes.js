import express from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

const VALID_TYPES = ["call", "email", "meeting", "task", "note"];
const VALID_STATUSES = ["pending", "completed", "cancelled"];
const PARENT_COLUMNS = ["contact_id", "account_id", "opportunity_id", "lead_id"];

// GET activities 
router.get("/", async (req, res) => {
  const parentCol = PARENT_COLUMNS.find((col) => req.query[col]);
  if (!parentCol) {
    return res.status(400).json({
      error: `Provide exactly one of: ${PARENT_COLUMNS.join(", ")}`,
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM crm.activities WHERE ${parentCol} = $1 ORDER BY created_at DESC`,
      [req.query[parentCol]]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// POST /api/activities  -- body must include exactly one parent id, matching
// the ck_activities_single_parent CHECK constraint in the DB.
router.post("/", async (req, res) => {
  const { type, subject, description, due_date, status, contact_id, account_id, opportunity_id, lead_id, owner_id } = req.body;

  if (!type || !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` });
  }
  if (!subject) {
    return res.status(400).json({ error: "subject is required" });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  const parentsSet = PARENT_COLUMNS.filter((col) => req.body[col] !== undefined && req.body[col] !== null);
  if (parentsSet.length !== 1) {
    return res.status(400).json({
      error: `Exactly one of ${PARENT_COLUMNS.join(", ")} must be provided`,
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO crm.activities
         (type, subject, description, due_date, status, owner_id, contact_id, account_id, opportunity_id, lead_id)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'pending'), $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        type, subject, description, due_date || null, status,
        owner_id || req.user.user_id,
        contact_id || null, account_id || null, opportunity_id || null, lead_id || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// PATCH /api/activities/:id  -- typically used to mark completed
router.patch("/:id", async (req, res) => {
  const fields = ["subject", "description", "due_date", "status"];
  const updates = fields.filter((f) => req.body[f] !== undefined);

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }
  if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => req.body[f]);

  try {
    const result = await pool.query(
      `UPDATE crm.activities SET ${setClause}, updated_at = now()
       WHERE activity_id = $${updates.length + 1}
       RETURNING *`,
      [...values, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

// DELETE /api/activities/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM crm.activities WHERE activity_id = $1 RETURNING activity_id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

export default router;
