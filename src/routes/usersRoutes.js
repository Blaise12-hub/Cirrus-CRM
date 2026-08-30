import express from "express";
import bcrypt from  "bcrypt";
import pool from "../db/pool.js"

import { requireAuth,requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

//roles to be used/accessible
const VALID_ROLES = ["admin", "manager", "sales_rep"];

//SELECT will be resrtricted to only display safe columns not select *
const SAFE_COLUMNS = "user_id, first_name, last_name, email, role, team_id, is_active, created_at, updated_at";


//only admin&manager can see users roster
//GET users 
router.get("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SAFE_COLUMNS} FROM crm.users ORDER BY first_name, last_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

//user/id
router.get("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SAFE_COLUMNS} FROM crm.users WHERE user_id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

//POST new user
router.post("/",requireRole("admin"),async(req,res)=>{
     if(!first_name || !last_name || !email || !password){
        return res.status(400).json({error:"Missing required fields"});
     }
     if(!VALID_ROLES.includes(role)){
        return res.status(400).json({error:"role must be one of: "+VALID_ROLES.join(", ")});
     }

     try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO crm.users (first_name, last_name, email, password_hash, role, team_id)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'sales_rep'), $6)
       RETURNING ${SAFE_COLUMNS}`,
      [first_name, last_name, email, password_hash, role, team_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A user with this email already exists" });
    }
    if (err.code === "23503") {
      return res.status(400).json({ error: "team_id does not refer to an existing team" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
})

//edits but not the password

router.patch("/:id", requireRole("admin"), async (req, res) => {
  const fields = ["first_name", "last_name", "email", "role", "team_id", "is_active"];
  const updates = fields.filter((f) => req.body[f] !== undefined);

  if (updates.length === 0) {
    return res.status(400).json({ error: "No valid fields provided to update" });
  }
  if (req.body.role && !VALID_ROLES.includes(req.body.role)) {
    return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` });
  }
  // Guard against an admin locking themselves out by accident.
  if (String(req.params.id) === String(req.user.user_id) && req.body.is_active === false) {
    return res.status(400).json({ error: "You can't deactivate your own account" });
  }

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => req.body[f]);

  try {
    const result = await pool.query(
      `UPDATE crm.users SET ${setClause}, updated_at = now()
       WHERE user_id = $${updates.length + 1}
       RETURNING ${SAFE_COLUMNS}`,
      [...values, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A user with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});


//edit together with password
router.patch("/:id/password", requireRole("admin"), async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "password is required and must be at least 8 characters" });
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `UPDATE crm.users SET password_hash = $1, updated_at = now()
       WHERE user_id = $2 RETURNING user_id, email`,
      [password_hash, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: `Password updated for ${result.rows[0].email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

//delete user   soft delete(user deleted may still own other activities in past) THEYRE JUST DISACTIVATED CAN LOG IN ANYMORE

router.delete("/:id", requireRole("admin"), async (req, res) => {
  if (String(req.params.id) === String(req.user.user_id)) {
    return res.status(400).json({ error: "You can't deactivate your own account" });
  }
  try {
    const result = await pool.query(
      `UPDATE crm.users SET is_active = false, updated_at = now()
       WHERE user_id = $1 RETURNING ${SAFE_COLUMNS}`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

export default router;