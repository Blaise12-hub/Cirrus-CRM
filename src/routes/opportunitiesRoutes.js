import express from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { ownerScope } from "../utils/scope.js";
import { resolveOwnerId, isValidId } from "../utils/policies.js";

const router = express.Router();
router.use(requireAuth);

const VALID_STAGES = ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"];

// GET /api/opportunities?stage=proposal  -- the pipeline board query
router.get("/", async (req, res) => {
  try {
    const conditions = ["1=1"];
    const params = [];

    if (req.query.stage) {
      params.push(req.query.stage);
      conditions.push(`o.stage = $${params.length}`);
    }
    if (req.query.account_id) {
      if (!isValidId(req.query.account_id)) {
        return res.status(400).json({ error: "Invalid account_id" });
      }
      params.push(req.query.account_id);
      conditions.push(`o.account_id = $${params.length}`);
    }

    const { clause, params: scopedParams } = ownerScope(req.user, "o.owner_id", params);

    const result = await pool.query(
      `SELECT o.*, a.account_name, c.first_name AS contact_first_name, c.last_name AS contact_last_name
       FROM crm.opportunities o
       INNER JOIN crm.accounts a ON a.account_id = o.account_id
       LEFT JOIN crm.contacts c ON c.contact_id = o.contact_id
       WHERE ${conditions.join(" AND ")} ${clause}
       ORDER BY o.close_date NULLS LAST`,
      scopedParams
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

// GET /api/opportunities/:id  -- scoped to owner
router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid opportunity id" });
  }
  try {
    const { clause, params } = ownerScope(req.user, "o.owner_id", [req.params.id]);
    const result = await pool.query(
      `SELECT o.*, a.account_name
       FROM crm.opportunities o
       INNER JOIN crm.accounts a ON a.account_id = o.account_id
       WHERE o.opportunity_id = $1 ${clause}`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch opportunity" });
  }
});

// POST /api/opportunities
router.post("/", async (req, res) => {
  const { account_id, contact_id, name, stage, amount, close_date, probability, owner_id } = req.body;

  if (!account_id || !name) {
    return res.status(400).json({ error: "account_id and name are required" });
  }
  if (!isValidId(account_id)) {
    return res.status(400).json({ error: "Invalid account_id" });
  }
  if (contact_id && !isValidId(contact_id)) {
    return res.status(400).json({ error: "Invalid contact_id" });
  }
  if (stage && !VALID_STAGES.includes(stage)) {
    return res.status(400).json({ error: `stage must be one of: ${VALID_STAGES.join(", ")}` });
  }

  try {
    const resolvedOwner = resolveOwnerId(req.user.role, owner_id, req.user.user_id);
    const result = await pool.query(
      `INSERT INTO crm.opportunities (account_id, contact_id, name, stage, amount, close_date, probability, owner_id)
       VALUES ($1, $2, $3, COALESCE($4, 'prospecting'), COALESCE($5, 0), $6, COALESCE($7, 0), $8)
       RETURNING *`,
      [account_id, contact_id || null, name.trim(), stage, amount, close_date || null, probability, resolvedOwner]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "Referenced account or contact does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create opportunity" });
  }
});

// PATCH /api/opportunities/:id/stage  -- scoped to owner
router.patch("/:id/stage", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid opportunity id" });
  }
  const { stage } = req.body;
  if (!stage || !VALID_STAGES.includes(stage)) {
    return res.status(400).json({ error: `stage must be one of: ${VALID_STAGES.join(", ")}` });
  }
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [stage, req.params.id]);
    const result = await pool.query(
      `UPDATE crm.opportunities SET stage = $1, updated_at = now()
       WHERE opportunity_id = $2 ${clause}
       RETURNING *`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update stage" });
  }
});

// PATCH /api/opportunities/:id  -- scoped to owner
router.patch("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid opportunity id" });
  }

  const allowedFields = ["account_id", "contact_id", "name", "stage", "amount", "close_date", "probability"];
  if (req.user.role === "admin" || req.user.role === "manager") {
    allowedFields.push("owner_id");
  }

  const updates = allowedFields.filter((f) => req.body[f] !== undefined);
  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }
  if (req.body.stage && !VALID_STAGES.includes(req.body.stage)) {
    return res.status(400).json({ error: `stage must be one of: ${VALID_STAGES.join(", ")}` });
  }
  if (req.body.account_id !== undefined && req.body.account_id !== null && !isValidId(req.body.account_id)) {
    return res.status(400).json({ error: "Invalid account_id" });
  }
  if (req.body.contact_id !== undefined && req.body.contact_id !== null && !isValidId(req.body.contact_id)) {
    return res.status(400).json({ error: "Invalid contact_id" });
  }

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => {
    const val = req.body[f];
    return typeof val === "string" ? val.trim() : val;
  });

  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [...values, req.params.id]);
    const result = await pool.query(
      `UPDATE crm.opportunities SET ${setClause}, updated_at = now()
       WHERE opportunity_id = $${updates.length + 1} ${clause}
       RETURNING *`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ error: "Referenced account or contact does not exist" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update opportunity" });
  }
});

// DELETE /api/opportunities/:id  -- scoped to owner
router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ error: "Invalid opportunity id" });
  }
  try {
    const { clause, params } = ownerScope(req.user, "owner_id", [req.params.id]);
    const result = await pool.query(
      `DELETE FROM crm.opportunities WHERE opportunity_id = $1 ${clause} RETURNING opportunity_id`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
});

export default router;
