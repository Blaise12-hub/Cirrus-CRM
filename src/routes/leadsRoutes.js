import express from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { ownerScope } from "../utils/scope.js";
import { resolveOwnerId, isValidId } from "../utils/policies.js";

const router = express.Router();
router.use(requireAuth);

const VALID_STATUSES = ["new", "contacted", "qualified", "converted", "disqualified"];

// GET /api/leads  -- list (scoped to owner unless manager/admin)
router.get("/", async (req, res) => {
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", []);
    const result = await pool.query(
      `SELECT * FROM crm.leads WHERE 1=1 ${clause} ORDER BY created_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// GET /api/leads/:id  -- scoped to owner
router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid lead id" });
  }
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [req.params.id]);
    const result = await pool.query(
      `SELECT * FROM crm.leads WHERE lead_id = $1 ${clause}`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// POST /api/leads
router.post("/", async (req, res) => {
  const { first_name, last_name, email, phone, company_name, lead_source, owner_id } = req.body;
  if (!first_name || !last_name) {
    return res.status(400).json({ error: "first_name and last_name are required" });
  }
  try {
    const resolvedOwner = resolveOwnerId(req.user.role, owner_id, req.user.user_id);
    const result = await pool.query(
      `INSERT INTO crm.leads (first_name, last_name, email, phone, company_name, lead_source, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [first_name.trim(), last_name.trim(), email || null, phone || null, company_name || null, lead_source || null, resolvedOwner]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

// PATCH /api/leads/:id  -- scoped to owner
router.patch("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid lead id" });
  }

  const allowedFields = ["first_name", "last_name", "email", "phone", "company_name", "lead_source", "status"];
  if (req.user.role === "admin" || req.user.role === "manager") {
    allowedFields.push("owner_id");
  }

  const updates = allowedFields.filter((f) => req.body[f] !== undefined);
  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }
  if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => {
    const val = req.body[f];
    return typeof val === "string" ? val.trim() : val;
  });

  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [...values, req.params.id]);
    const result = await pool.query(
      `UPDATE crm.leads SET ${setClause}, updated_at = now()
       WHERE lead_id = $${updates.length + 1} ${clause}
       RETURNING *`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

// POST /api/leads/:id/convert  -- scoped transaction
router.post("/:id/convert", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid lead id" });
  }

  const { create_account, account_id } = req.body;
  if (account_id && !isValidId(account_id)) {
    return res.status(400).json({ error: "Invalid account_id" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { clause, params } = ownerScope(req.user, "owner_id", [req.params.id]);
    const leadResult = await client.query(
      `SELECT * FROM crm.leads WHERE lead_id = $1 ${clause} FOR UPDATE`,
      params
    );
    const lead = leadResult.rows[0];
    if (!lead) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Lead not found" });
    }
    if (lead.status === "converted") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Lead is already converted" });
    }

    let resolvedAccountId = account_id || null;

    if (create_account && lead.company_name) {
      const accountResult = await client.query(
        `INSERT INTO crm.accounts (account_name, owner_id) VALUES ($1, $2) RETURNING account_id`,
        [lead.company_name, lead.owner_id]
      );
      resolvedAccountId = accountResult.rows[0].account_id;
    }

    const contactResult = await client.query(
      `INSERT INTO crm.contacts (account_id, first_name, last_name, email, phone, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [resolvedAccountId, lead.first_name, lead.last_name, lead.email, lead.phone, lead.owner_id]
    );
    const contact = contactResult.rows[0];

    const updatedLeadResult = await client.query(
      `UPDATE crm.leads SET status = 'converted', converted_contact_id = $1, updated_at = now()
       WHERE lead_id = $2
       RETURNING *`,
      [contact.contact_id, req.params.id]
    );

    await client.query("COMMIT");
    res.json({ lead: updatedLeadResult.rows[0], contact });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to convert lead" });
  } finally {
    client.release();
  }
});

// DELETE /api/leads/:id  -- scoped to owner
router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid lead id" });
  }
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [req.params.id]);
    const result = await pool.query(
      `DELETE FROM crm.leads WHERE lead_id = $1 ${clause} RETURNING lead_id`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

export default router;
