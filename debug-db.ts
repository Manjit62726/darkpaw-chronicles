import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon("postgresql://neondb_owner:npg_ynsj7izKPV8H@ep-steep-mouse-arre97cz.c-4.us-west-2.aws.neon.tech/neondb?sslmode=require");
  const rows = await sql`SELECT id, username, password_hash FROM admins`;
  console.log("Admins:", JSON.stringify(rows, null, 2));

  // Test password hash
  const encoder = new TextEncoder();
  const data = encoder.encode("admin123" + "darkpaw_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  console.log("Expected hash:", hash);

  if (rows.length > 0) {
    console.log("DB hash:", rows[0].password_hash);
    console.log("Match:", hash === rows[0].password_hash);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
