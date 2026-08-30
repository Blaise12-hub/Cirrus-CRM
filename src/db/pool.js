import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;
const requiresSSL = /sslmode=require/.test(process.env.DATABASE_URL || "");
// A single shared connection pool for the whole app. Every query should go
// through this rather than opening ad-hoc clients.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  //adding option that u can work on crm  shema wihout adding:".crm" on every query
  options: "-c search_path=crm",
  //this trips Neon's strict verification 
  ssl: requiresSSL ? { rejectUnauthorized: false,} : false,
});

pool.on("error", (err) => {
  // Fires on idle client errors (e.g. DB connection dropped). Log loudly --
  // this should never be swallowed silently in production.
  console.error("Unexpected PG pool error:", err);
});

export default pool;
