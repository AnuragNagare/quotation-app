// One-shot migration for EXISTING databases created under the
// "Enquiry to Quotation" single-admin-role restructure, restoring the
// original 3-role model (Admin / Business User / Client):
//   1. Widen users.role to allow 'business_user' and 'client' again.
//   2. Copy every row from the `clients` contacts table into `users` with
//      role='client', preserving ids so enquiries keep pointing at the
//      right person.
//   3. Re-point enquiries.client_id from clients(id) to users(id).
//   4. Drop the now-unused `clients` table.
//
// CAVEAT: contact-only client rows have no password. This script assigns
// each one a random, unknown password hash so the column stays non-null —
// those clients CANNOT log in until an admin resets their password
// directly in the database (there is no self-service reset flow yet).
//
// Before running this against a database with real data, check row counts
// first:
//   select count(*) from clients;
//   select role, count(*) from users group by role;
//
// Run with: NEON_DATABASE_URL=<url> node scripts/migrate-restore-roles.mjs
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const sql = neon(process.env.NEON_DATABASE_URL);

async function main() {
  await sql`alter table users drop constraint if exists users_role_check`;
  await sql`
    alter table users
    add constraint users_role_check check (role in ('admin','business_user','client'))
  `;

  const clientRows = await sql`select * from clients`;
  for (const client of clientRows) {
    const passwordHash = await bcrypt.hash(randomUUID(), 10);
    await sql`
      insert into users (id, email, password_hash, role, full_name, phone, created_at)
      values (
        ${client.id},
        ${client.email ?? `${client.id}@unclaimed.local`},
        ${passwordHash},
        'client',
        ${client.full_name},
        ${client.phone},
        ${client.created_at}
      )
      on conflict (id) do nothing
    `;
  }

  await sql`alter table enquiries drop constraint if exists enquiries_client_id_fkey`;
  await sql`
    alter table enquiries
    add constraint enquiries_client_id_fkey
    foreign key (client_id) references users(id) on delete cascade
  `;

  await sql`drop table if exists clients`;

  console.log(`Role restoration completed. Migrated ${clientRows.length} client(s) into users.`);
  console.log('Reminder: migrated clients have an unknown random password and cannot log in until reset.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
