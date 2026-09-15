import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import pool from "../src/db/pool.js";

const DEMO_PASSWORD = "Password123!";

const DEMO_USERS = [
  "amara.uwase@example.com",
  "eric.nshuti@example.com",
  "diane.mukiza@example.com",
];

async function run() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const email of DEMO_USERS) {
    const result = await pool.query(
      `UPDATE crm.users SET password_hash = $1 WHERE email = $2 RETURNING user_id, email`,
      [hash, email]
    );
    if (result.rows.length === 0) {
      console.warn(`No user found for ${email} -- did you run the schema/seed SQL first?`);
    } else {
      console.log(`Password set for ${result.rows[0].email}`);
    }
  }

  console.log(`\nAll demo users can now log in with password: ${DEMO_PASSWORD}`);
  await pool.end();
}

run().catch((err) => {
  console.error("Failed to seed user passwords:", err);
  process.exit(1);
});