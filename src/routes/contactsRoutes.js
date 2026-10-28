import express from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { ownerScope } from "../utils/scope.js";
import { resolveOwnerId, isValidId } from "../utils/policies.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/contacts  -- list (scoped to owner unless manager/admin)
router.get("/", async (req, res) => {
  try {
    const conditions = ["1=1"];
    const params = [];

    if (req.query.account_id) {
      if (!isValidId(req.query.account_id)) {
        return res.status(400).json({ error: "Invalid account_id" });
      }
      params.push(req.query.account_id);
      conditions.push(`account_id = $${params.length}`);
    }

    const { clause, params: scopedParams } = ownerScope(req.user, "owner_id", params);

    const result = await pool.query(
      `SELECT * FROM crm.contacts WHERE ${conditions.join(" AND ")} ${clause} ORDER BY last_name`,
      scopedParams
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// GET /api/contacts/:id  -- scoped to owner
router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid contact id" });
  }
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [req.params.id]);
    const result = await pool.query(
      `SELECT * FROM crm.contacts WHERE contact_id = $1 ${clause}`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
});

// POST /api/contacts
router.post("/", async (req, res) => {
  const { account_id, first_name, last_name, email, phone, job_title, owner_id } = req.body;
  if (!first_name || !last_name) {
    return res.status(400).json({ error: "first_name and last_name are required" });
  }
  if (account_id && !isValidId(account_id)) {
    return res.status(400).json({ error: "Invalid account_id" });
  }
  try {
    const resolvedOwner = resolveOwnerId(req.user.role, owner_id, req.user.user_id);
    const result = await pool.query(
      `INSERT INTO crm.contacts (account_id, first_name, last_name, email, phone, job_title, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [account_id || null, first_name.trim(), last_name.trim(), email || null, phone || null, job_title || null, resolvedOwner]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A contact with this email already exists" });
    }
    if (err.code === "23503") {
      return res.status(400).json({ error: "account_id does not refer to an existing account" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// PATCH /api/contacts/:id  -- scoped to owner
router.patch("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid contact id" });
  }

  const allowedFields = ["account_id", "first_name", "last_name", "email", "phone", "job_title"];
  if (req.user.role === "admin" || req.user.role === "manager") {
    allowedFields.push("owner_id");
  }

  const updates = allowedFields.filter((f) => req.body[f] !== undefined);
  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }

  if (req.body.account_id !== undefined && req.body.account_id !== null && !isValidId(req.body.account_id)) {
    return res.status(400).json({ error: "Invalid account_id" });
  }

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => {
    const val = req.body[f];
    return typeof val === "string" ? val.trim() : val;
  });

  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [...values, req.params.id]);
    const result = await pool.query(
      `UPDATE crm.contacts SET ${setClause}, updated_at = now()
       WHERE contact_id = $${updates.length + 1} ${clause}
       RETURNING *`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A contact with this email already exists" });
    }
    if (err.code === "23503") {
      return res.status(400).json({ error: "account_id does not refer to an existing account" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// DELETE /api/contacts/:id  -- scoped to owner
router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid contact id" });
  }
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [req.params.id]);
    const result = await pool.query(
      `DELETE FROM crm.contacts WHERE contact_id = $1 ${clause} RETURNING contact_id`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

export default router;
