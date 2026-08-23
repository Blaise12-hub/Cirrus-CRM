const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { ownerScope } = require("../utils/scope");

const router = express.Router();
router.use(requireAuth);

// GET /api/contacts?account_id=5  -- optional filter by account
router.get("/", async (req, res) => {
  try {
    const conditions = ["1=1"];
    const params = [];

    if (req.query.account_id) {
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

// GET /api/contacts/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM crm.contacts WHERE contact_id = $1`, [req.params.id]);
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
  try {
    const result = await pool.query(
      `INSERT INTO crm.contacts (account_id, first_name, last_name, email, phone, job_title, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [account_id || null, first_name, last_name, email, phone, job_title, owner_id || req.user.user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A contact with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// PATCH /api/contacts/:id
router.patch("/:id", async (req, res) => {
  const fields = ["account_id", "first_name", "last_name", "email", "phone", "job_title", "owner_id"];
  const updates = fields.filter((f) => req.body[f] !== undefined);

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => req.body[f]);

  try {
    const result = await pool.query(
      `UPDATE crm.contacts SET ${setClause}, updated_at = now()
       WHERE contact_id = $${updates.length + 1}
       RETURNING *`,
      [...values, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// DELETE /api/contacts/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM crm.contacts WHERE contact_id = $1 RETURNING contact_id`,
      [req.params.id]
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

module.exports = router;
