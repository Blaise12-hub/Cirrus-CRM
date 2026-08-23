const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { ownerScope } = require("../utils/scope");

const router = express.Router();
router.use(requireAuth);

// GET /api/accounts  -- list (scoped to owner unless manager/admin)
router.get("/", async (req, res) => {
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", []);
    const result = await pool.query(
      `SELECT * FROM crm.accounts WHERE 1=1 ${clause} ORDER BY account_name`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// GET /api/accounts/:id
router.get("/:id", async (req, res) => {
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [req.params.id]);
    const result = await pool.query(
      `SELECT * FROM crm.accounts WHERE account_id = $1 ${clause}`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

// POST /api/accounts
router.post("/", async (req, res) => {
  const { account_name, industry, website, phone, billing_address, owner_id } = req.body;
  if (!account_name) {
    return res.status(400).json({ error: "account_name is required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO crm.accounts (account_name, industry, website, phone, billing_address, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [account_name, industry, website, phone, billing_address, owner_id || req.user.user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// PATCH /api/accounts/:id
router.patch("/:id", async (req, res) => {
  const fields = ["account_name", "industry", "website", "phone", "billing_address", "owner_id"];
  const updates = fields.filter((f) => req.body[f] !== undefined);

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => req.body[f]);

  try {
    const result = await pool.query(
      `UPDATE crm.accounts SET ${setClause}, updated_at = now()
       WHERE account_id = $${updates.length + 1}
       RETURNING *`,
      [...values, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update account" });
  }
});

// DELETE /api/accounts/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM crm.accounts WHERE account_id = $1 RETURNING account_id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === "23503") {
      // foreign_key_violation -- e.g. opportunities.account_id RESTRICT
      return res.status(409).json({
        error: "Cannot delete: this account has related records (e.g. opportunities) that block deletion",
      });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

module.exports = router;
