// Adds delivery details to enquiries: where, when, who to contact, and (for
// open-visitor enquiries) the visitor's optional company name.
// All columns are nullable so existing enquiries (and the client self-checkout
// flow, which doesn't collect them) keep working.
//
// Run with: node --env-file=.env.local scripts/migrate-add-enquiry-details.mjs
import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL or NEON_DATABASE_URL found in environment");
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  await sql`alter table enquiries add column if not exists location text`;
  await sql`alter table enquiries add column if not exists delivery_date date`;
  await sql`alter table enquiries add column if not exists contact_name text`;
  await sql`alter table enquiries add column if not exists contact_phone text`;
  // Optional company name entered by visitors on a company's public enquiry page.
  await sql`alter table enquiries add column if not exists client_company text`;
  console.log('Successfully added location, delivery_date, contact_name, contact_phone, client_company to enquiries.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
