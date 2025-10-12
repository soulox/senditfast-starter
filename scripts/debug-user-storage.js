/**
 * Debug user storage and transfer linkage
 * Usage: node scripts/debug-user-storage.js user@example.com
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const email = process.argv[2] || process.env.DEBUG_EMAIL;
  if (!email) {
    console.error('Usage: node scripts/debug-user-storage.js user@example.com');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  const output = { email };
  try {
    const [user] = await sql`SELECT id, email, plan, role, created_at FROM app_user WHERE email = ${email} LIMIT 1`;
    output.user = user || null;
    if (!user) {
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    const [transfersAgg] = await sql`
      SELECT COUNT(*)::int AS transfers, COALESCE(SUM(total_size_bytes),0)::bigint AS total_bytes
      FROM transfer WHERE owner_id = ${user.id}
    `;
    output.transfersAggregate = transfersAgg;

    const transfers = await sql`
      SELECT id, total_size_bytes, created_at
      FROM transfer WHERE owner_id = ${user.id} ORDER BY created_at DESC
    `;
    output.transfers = transfers;

    const [filesAgg] = await sql`
      SELECT COUNT(f.id)::int AS files, COALESCE(SUM(f.size_bytes),0)::bigint AS total_file_bytes
      FROM transfer t JOIN file_object f ON f.transfer_id = t.id
      WHERE t.owner_id = ${user.id}
    `;
    output.filesAggregate = filesAgg;

    const files = await sql`
      SELECT f.id, f.size_bytes, f.created_at, f.transfer_id
      FROM transfer t JOIN file_object f ON f.transfer_id = t.id
      WHERE t.owner_id = ${user.id} ORDER BY f.created_at DESC
    `;
    output.files = files;

    console.log(JSON.stringify(output, null, 2));
  } catch (err) {
    console.error('Query error:', err);
    process.exit(1);
  }
}

main();


