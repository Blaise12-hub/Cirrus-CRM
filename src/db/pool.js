import pg from "pg";

const { Pool } = pg;

// A single shared connection pool for the whole app. Every query should go
// through this rather than opening ad-hoc clients.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Always operate against the crm schema without needing "crm." prefixes
  // on every query.
  options: "-c search_path=crm,public",
});

pool.on("error", (err) => {
  // Fires on idle client errors (e.g. DB connection dropped). Log loudly --
  // this should never be swallowed silently in production.
  console.error("Unexpected PG pool error:", err);
});

export default pool;
