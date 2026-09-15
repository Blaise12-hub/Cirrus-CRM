import { Router } from "express";
import pool from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Catalog is readable by anyone authenticated (sales reps need it to add
// line items to their opportunities); only admin/manager can create/edit.
// No hard DELETE — soft-delete via is_active, same pattern as users, since
// hard-deleting a product referenced in opportunity_products would violate
// the FK on existing line items.

router.get("/", requireAuth, async (req, res) => {
  try {
    const { active } = req.query;
    let sql = "SELECT * FROM crm.products";
    const params = [];
    if (active === "true") {
      sql += " WHERE is_active = true";
    }
    sql += " ORDER BY name";
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("products list error:", err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM crm.products WHERE product_id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("product get error:", err);
    res.status(500).json({ error: "Failed to load product" });
  }
});

router.post("/", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: "name and price are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO crm.products (name, price, description, is_active)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [name, price, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "A product with that name already exists" });
    console.error("product create error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.patch("/:id", requireAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const { name, price, description, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE crm.products SET
         name = COALESCE($1, name),
         price = COALESCE($2, price),
         description = COALESCE($3, description),
         is_active = COALESCE($4, is_active)
       WHERE product_id = $5 RETURNING *`,
      [name ?? null, price ?? null, description ?? null, is_active ?? null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "A product with that name already exists" });
    console.error("product update error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

export default router;