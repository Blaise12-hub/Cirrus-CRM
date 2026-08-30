// import { Pool } from 'pg';


// // ..db configuration
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL || 'postgresql://crm_user:crm_password@localhost:5432/crm_db',
// });

// async function seedUsers() {
//   const client = await pool.connect();
  
//   try {
//     console.log('🌱 Starting CRM user and team seeding...');

//     await client.query('BEGIN');

//     // 1. Insert Teams
//     await client.query(`
//       INSERT INTO crm.teams (team_id, team_name) VALUES
//         (1, 'Enterprise Sales'),
//         (2, 'SMB Sales')
//       ON CONFLICT (team_id) DO NOTHING;
//     `);

//     // 2. Insert Users
//     await client.query(`
//       INSERT INTO crm.users (user_id, first_name, last_name, email, password_hash, role, team_id) VALUES
//         (1, 'Amara', 'Uwase', 'amara.uwase@example.com', 'hash1', 'manager', 1),
//         (2, 'Eric', 'Nshuti', 'eric.nshuti@example.com', 'hash2', 'sales_rep', 1),
//         (3, 'Diane', 'Mukiza', 'diane.mukiza@example.com', 'hash3', 'sales_rep', 2)
//       ON CONFLICT (user_id) DO NOTHING;
//     `);

//     // 3. Update Team Managers
//     await client.query(`UPDATE crm.teams SET manager_id = 1 WHERE team_id = 1;`);
//     await client.query(`UPDATE crm.teams SET manager_id = 1 WHERE team_id = 2;`);

//     // 4. Reset Identity Sequences (Critical for explicit ID inserts)
//     await client.query(`
//       SELECT setval(pg_get_serial_sequence('crm.teams', 'team_id'), COALESCE((SELECT MAX(team_id) FROM crm.teams), 1));
//       SELECT setval(pg_get_serial_sequence('crm.users', 'user_id'), COALESCE((SELECT MAX(user_id) FROM crm.users), 1));
//     `);

//     await client.query('COMMIT');
//     console.log('✅ Successfully seeded teams and users!');
//     process.exit(0);

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error seeding users and teams:', error);
//     process.exit(1);
//   } finally {
//     client.release();
//   }
// }

// seedUsers();


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
      console.warn(`No user found for ${email} -- did you register the user?`);
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