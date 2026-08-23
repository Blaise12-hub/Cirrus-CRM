const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

const router = express.Router();

// POST /api/auth/register
// can be done now without auth (mock data)
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, password, role, team_id } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "first_name, last_name, email, and password are required" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO crm.users (first_name, last_name, email, password_hash, role, team_id)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'sales_rep'), $6)
       RETURNING user_id, first_name, last_name, email, role, team_id, created_at`,
      [first_name, last_name, email, password_hash, role, team_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    //err:23505 unique constraint violation
    if (err.code === "23505") {
      // emails must be unique,unless error is thrown
      if (err.constraint === "uq_users_email") {
        return res.status(409).json({ error: "A user with this email already exists" });
      }
      console.error("Unexpected unique_violation on users insert:", err.constraint, err);
      return res.status(500).json({ error: "Failed to register user due to a server-side ID conflict" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, password_hash, role, is_active
       FROM crm.users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
