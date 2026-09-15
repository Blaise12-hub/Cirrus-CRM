import { Router } from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Mounted at /api/opportunities so paths read as
// /api/opportunities/:id/products — kept in its own file rather than
// editing opportunities.routes.js directly, since that file's current
// contents weren't available to check against.

router.get("/:id/products", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT op.opportunity_id, op.product_id, op.quantity, op.unit_price,
              p.name, p.description
       FROM crm.opportunity_products op
       JOIN crm.products p ON p.product_id = op.product_id
       WHERE op.opportunity_id = $1
       ORDER BY p.name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("opportunity products list error:", err);
    res.status(500).json({ error: "Failed to load line items" });
  }
});

// Upsert: adding a product already on the opportunity updates its quantity
// / price instead of erroring, since (opportunity_id, product_id) is the
// composite PK. unit_price is optional — omit it to use the product's
// current catalog price.
router.post("/:id/products", requireAuth, async (req, res) => {
  try {
    const { product_id, quantity, unit_price } = req.body;
    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "product_id and a positive quantity are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO crm.opportunity_products (opportunity_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, COALESCE($4::numeric, (SELECT price FROM crm.products WHERE product_id = $2)))
       ON CONFLICT (opportunity_id, product_id)
       DO UPDATE SET quantity = EXCLUDED.quantity, unit_price = EXCLUDED.unit_price
       RETURNING *`,
      [req.params.id, product_id, quantity, unit_price ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23503") return res.status(400).json({ error: "That product or opportunity doesn't exist" });
    console.error("opportunity product upsert error:", err);
    res.status(500).json({ error: "Failed to add product to opportunity" });
  }
});

router.delete("/:id/products/:productId", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM crm.opportunity_products WHERE opportunity_id = $1 AND product_id = $2",
      [req.params.id, req.params.productId]
    );
    res.status(204).send();
  } catch (err) {
    console.error("opportunity product remove error:", err);
    res.status(500).json({ error: "Failed to remove product" });
  }
});

export default router;