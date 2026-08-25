// One-shot migration for EXISTING databases created before the
// "Enquiry to Quotation" restructure:
//   1. Clients become lightweight contact records in a new `clients` table
//      (no login, no password) — existing client users are copied over with
//      their ids preserved so enquiries keep pointing at the right person.
//   2. enquiries.client_id is re-pointed from users(id) to clients(id).
//   3. The business_user role is merged into admin (single internal role);
//      leftover client rows in users are removed.
//
// Run with: NEON_DATABASE_URL=<url> node scripts/migrate-decouple-clients.mjs
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL);

async function main() {
  await sql`
    create table if not exists clients (
      id uuid primary key default gen_random_uuid(),
      full_name text not null,
      email text,
      phone text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists clients_email_idx on clients(lower(email))`;

  await sql`
    insert into clients (id, full_name, email, phone, created_at)
    select id, full_name, email, phone, created_at
    from users where role = 'client'
    on conflict (id) do nothing
  `;

  await sql`alter table enquiries drop constraint if exists enquiries_client_id_fkey`;
  await sql`
    alter table enquiries
    add constraint enquiries_client_id_fkey
    foreign key (client_id) references clients(id) on delete cascade
  `;

  await sql`update users set role = 'admin' where role = 'business_user'`;
  await sql`delete from users where role = 'client'`;

  console.log('Client decoupling migration completed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
