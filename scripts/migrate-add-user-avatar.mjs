import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL or NEON_DATABASE_URL found in environment");
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  await sql`alter table users add column if not exists avatar_url text`;
  console.log('Successfully added avatar_url column to users table.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
