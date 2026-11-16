import { neon } from "@neondatabase/serverless";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- someone@example.com");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`UPDATE users SET role = 'admin' WHERE email = ${email} RETURNING full_name`;
if (rows.length === 0) {
  console.error(`No account found for ${email}. Sign up in the app first, then run this again.`);
  process.exit(1);
}
console.log(`${rows[0].full_name} (${email}) is now an admin.`);
