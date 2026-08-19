import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL);

async function main() {
  await sql`create extension if not exists pgcrypto`;

  await sql`
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      password_hash text not null,
      role text not null check (role in ('admin','business_user','client')),
      full_name text not null default '',
      phone text,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists companies (
      id uuid primary key default gen_random_uuid(),
      owner_id uuid not null references users(id) on delete cascade,
      name text not null,
      description text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists companies_owner_id_idx on companies(owner_id)`;

  await sql`
    create table if not exists categories (
      id uuid primary key default gen_random_uuid(),
      company_id uuid not null references companies(id) on delete cascade,
      type text not null check (type in ('product','service')),
      name text not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists categories_company_id_idx on categories(company_id)`;

  await sql`
    create table if not exists catalog_items (
      id uuid primary key default gen_random_uuid(),
      company_id uuid not null references companies(id) on delete cascade,
      category_id uuid not null references categories(id) on delete cascade,
      type text not null check (type in ('product','service')),
      name text not null,
      description text,
      price numeric(12,2) not null default 0,
      unit text,
      is_active boolean not null default true,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists catalog_items_company_id_idx on catalog_items(company_id)`;
  await sql`create index if not exists catalog_items_category_id_idx on catalog_items(category_id)`;

  await sql`
    create table if not exists enquiries (
      id uuid primary key default gen_random_uuid(),
      client_id uuid not null references users(id) on delete cascade,
      status text not null default 'open' check (status in ('open','quoted','closed')),
      notes text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists enquiries_client_id_idx on enquiries(client_id)`;

  await sql`
    create table if not exists enquiry_line_items (
      id uuid primary key default gen_random_uuid(),
      enquiry_id uuid not null references enquiries(id) on delete cascade,
      catalog_item_id uuid not null references catalog_items(id),
      company_id uuid not null references companies(id),
      quantity integer not null default 1 check (quantity > 0),
      notes text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists eli_enquiry_id_idx on enquiry_line_items(enquiry_id)`;
  await sql`create index if not exists eli_company_id_idx on enquiry_line_items(company_id)`;

  await sql`
    create table if not exists quotes (
      id uuid primary key default gen_random_uuid(),
      enquiry_id uuid not null references enquiries(id) on delete cascade,
      company_id uuid not null references companies(id) on delete cascade,
      business_user_id uuid not null references users(id),
      status text not null default 'draft' check (status in ('draft','sent','pending','approved','cancelled','revision')),
      tax_rate_percent numeric(5,2) not null default 18,
      terms text,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (enquiry_id, company_id)
    )
  `;
  await sql`create index if not exists quotes_enquiry_id_idx on quotes(enquiry_id)`;
  await sql`create index if not exists quotes_company_id_idx on quotes(company_id)`;

  await sql`
    create table if not exists quote_line_items (
      id uuid primary key default gen_random_uuid(),
      quote_id uuid not null references quotes(id) on delete cascade,
      enquiry_line_item_id uuid references enquiry_line_items(id),
      name text not null,
      quantity integer not null default 1 check (quantity > 0),
      unit_price numeric(12,2) not null default 0,
      discount_percent numeric(5,2) not null default 0,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists qli_quote_id_idx on quote_line_items(quote_id)`;

  await sql`
    create table if not exists quote_revisions (
      id uuid primary key default gen_random_uuid(),
      quote_id uuid not null references quotes(id) on delete cascade,
      version text not null,
      label text,
      is_current boolean not null default true,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists qr_quote_id_idx on quote_revisions(quote_id)`;

  console.log('Schema created successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
