import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

const requiresSSL = /sslmode=require/.test(process.env.DATABASE_URL || "");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requiresSSL ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error:", err);
});

export default pool;