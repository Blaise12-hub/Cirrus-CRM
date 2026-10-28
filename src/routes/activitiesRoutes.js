import express from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { ownerScope } from "../utils/scope.js";
import { resolveOwnerId } from "../utils/policies.js";
import {
  PARENT_COLUMNS,
  PARENT_TABLES,
  isValidId,
  validateCreate,
  validateUpdate,
  getListParent,
  getBucketClause,
} from "../utils/activityPolicies.js";

const router = express.Router();
router.use(requireAuth);

// True if the parent record exists and is visible to the caller.
async function parentVisible(user, parentCol, parentId) {
  const { clause, params } = ownerScope(user, "owner_id", [parentId]);
  const result = await pool.query(
    `SELECT 1 FROM ${PARENT_TABLES[parentCol]} WHERE ${parentCol} = $1 ${clause}`,
    params
  );
  return result.rows.length > 0;
}

// GET /api/activities/mine?bucket=overdue|today|upcoming|all
// The caller's own pending tasks (dashboard widget / reminders).
router.get("/mine", async (req, res) => {
  const bucketClause = getBucketClause(req.query.bucket);
  if (bucketClause === null) {
    return res.status(400).json({ error: "bucket must be one of: overdue, today, upcoming, all" });
  }
  const extra = bucketClause ? ` AND ${bucketClause}` : "";

  try {
    const result = await pool.query(
      `SELECT * FROM crm.activities
       WHERE owner_id = $1 AND type = 'task' AND status = 'pending'${extra}
       ORDER BY due_date ASC NULLS LAST, created_at DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET activities
router.get("/", async (req, res) => {
  const parsed = getListParent(req.query);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }
  const { parentCol, parentId } = parsed;

  try {
    if (!(await parentVisible(req.user, parentCol, parentId))) {
      return res.status(404).json({ error: "Parent record not found" });
    }
    const result = await pool.query(
      `SELECT * FROM crm.activities WHERE ${parentCol} = $1 ORDER BY created_at DESC`,
      [parentId]
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
  const parsed = validateCreate(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }
  const { parentCol, parentId } = parsed;
  const { type, subject, description, due_date, status, owner_id } = req.body;

  try {
    if (!(await parentVisible(req.user, parentCol, parentId))) {
      return res.status(404).json({ error: "Parent record not found" });
    }

    const parents = Object.fromEntries(PARENT_COLUMNS.map((col) => [col, null]));
    parents[parentCol] = parentId;

    const result = await pool.query(
      `INSERT INTO crm.activities
         (type, subject, description, due_date, status, owner_id, contact_id, account_id, opportunity_id, lead_id)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'pending'), $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        type, subject.trim(), description, due_date || null, status,
        resolveOwnerId(req.user.role, owner_id, req.user.user_id),
        parents.contact_id, parents.account_id, parents.opportunity_id, parents.lead_id,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "Referenced record or owner does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// PATCH /api/activities/:id  -- typically used to mark completed
router.patch("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid activity id" });
  }
  const parsed = validateUpdate(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }
  const { updates } = parsed;

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => (f === "subject" ? req.body[f].trim() : req.body[f]));

  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [...values, req.params.id]);
    const result = await pool.query(
      `UPDATE crm.activities SET ${setClause}, updated_at = now()
       WHERE activity_id = $${updates.length + 1} ${clause}
       RETURNING *`,
      params
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
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid activity id" });
  }
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [req.params.id]);
    const result = await pool.query(
      `DELETE FROM crm.activities WHERE activity_id = $1 ${clause} RETURNING activity_id`,
      params
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
