const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { ownerScope } = require("../utils/scope");

const router = express.Router();
router.use(requireAuth);

const VALID_STATUSES = ["new", "contacted", "qualified", "converted", "disqualified"];

// GET /api/leads
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

// POST /api/leads
router.post("/", async (req, res) => {
  const { first_name, last_name, email, phone, company_name, lead_source, owner_id } = req.body;
  if (!first_name || !last_name) {
    return res.status(400).json({ error: "first_name and last_name are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO crm.leads (first_name, last_name, email, phone, company_name, lead_source, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [first_name, last_name, email, phone, company_name, lead_source, owner_id || req.user.user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

// PATCH /api/leads/:id  -- general updates (status, owner reassignment, etc.)
router.patch("/:id", async (req, res) => {
  const fields = ["first_name", "last_name", "email", "phone", "company_name", "lead_source", "status", "owner_id"];
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
      `UPDATE crm.leads SET ${setClause}, updated_at = now()
       WHERE lead_id = $${updates.length + 1}
       RETURNING *`,
      [...values, req.params.id]
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

// POST /api/leads/:id/convert
// The one real piece of business logic here: turns a lead into a contact
// (and optionally an account) inside a single transaction, then marks the
// lead as converted and links it. If any step fails, everything rolls back.
router.post("/:id/convert", async (req, res) => {
  const { create_account, account_id } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const leadResult = await client.query(`SELECT * FROM crm.leads WHERE lead_id = $1 FOR UPDATE`, [req.params.id]);
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

module.exports = router;
