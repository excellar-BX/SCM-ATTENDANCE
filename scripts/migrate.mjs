import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

for (const statement of schema.split(/;\s*$/m).map((s) => s.trim()).filter(Boolean)) {
  await sql.query(statement);
}
console.log("Database schema is up to date.");
