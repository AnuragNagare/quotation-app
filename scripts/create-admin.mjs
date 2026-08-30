// Creates a new admin user, or promotes an existing account to admin if the
// email already exists. There is no self-service admin signup in the app
// (api/auth.ts rejects role: "admin" on signup), so this is the only way to
// get an admin account today.
//
// Run with: node --env-file=.env.local scripts/create-admin.mjs [email] [password] ["full name"]
// All three args are optional — falls back to a demo admin if omitted.
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const sql = neon(process.env.NEON_DATABASE_URL);

const email = process.argv[2] || 'admin@demo.com';
const password = process.argv[3] || 'DemoAdmin123!';
const fullName = process.argv[4] || 'Demo Admin';

async function main() {
  const existing = await sql`select id from users where email = ${email}`;
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing.length > 0) {
    await sql`
      update users set role = 'admin', password_hash = ${passwordHash}, full_name = ${fullName}
      where id = ${existing[0].id}
    `;
    console.log(`Promoted existing user ${email} to admin and reset their password.`);
  } else {
    const id = randomUUID();
    await sql`
      insert into users (id, email, password_hash, role, full_name)
      values (${id}, ${email}, ${passwordHash}, 'admin', ${fullName})
    `;
    console.log(`Created new admin user: ${email}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
