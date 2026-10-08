# Lovable Prompt: Enquiry-to-Quotation Multi-Tenant Platform

You are building a full-stack, multi-tenant web application called **"Enquiry to Quotation" (ETQ)**.

The platform is an **enquiry-first B2B/B2C marketplace and quotation management system**. Clients browse products and services from multiple vendor companies, add them to a unified enquiry cart, and submit enquiries. Vendor companies (Business Users) receive their slice of each enquiry, review it on a dedicated editable page, convert it into formal quotations, edit prices, margins, discounts, taxes, and terms, and maintain version revisions (v1.0, v1.1, etc.). Platform Admins oversee user accounts, inspect all platform records, and manage account governance.

---

## 1. Core Personas & Roles

The system has **three distinct roles**:

### 1. `client` (Buyer / Customer)
- **Marketplace Browsing**: Can browse the public directory of vendor companies, explore their products and services, and filter by categories without signing in.
- **Unified Cart**: Adds items from one or multiple companies into a single enquiry cart.
- **Instant Checkout**: Submits the enquiry. If not logged in, creates an account with Name, Email, and Password on the checkout page in a single seamless step.
- **My Enquiries (`/my-enquiries`)**: A dashboard listing past enquiries, their statuses (`open`, `quoted`, `closed`), item breakdowns grouped by company, and direct links to view quotes issued by vendors.
- **Enquiry & Quote Document View**: Can open full dedicated printable page views for their enquiries (`/enquiries/:id/preview`) and quotes (`/quotes/:id/preview`).

### 2. `business_user` (Vendor / Company Owner)
- **Multi-Company Management (`/companies`)**: Can own and manage multiple isolated companies. Selects an "Active Company" from a switcher in the UI—everything else in their dashboard scopes to this active company.
- **Catalog Management (`/catalog`)**:
  - Two catalog types: **Product** and **Service**.
  - Dynamic user-created categories under Product or Service.
  - Catalog items under each category with: Name, Description, Unit Price, Unit of Measurement (e.g., pcs, hrs, days), and Active/Inactive toggle.
- **Enquiries Inbox (`/biz/enquiries`)**:
  - View all client enquiries that contain items belonging to their active company.
  - Action button: **"Add Enquiry for Client"** dialog to manually record an enquiry on behalf of an existing client (with real-time autocomplete search) or a brand-new client.
- **Enquiry Page View & Full Editing (`/biz/enquiries/:enquiryId`)**:
  - **Must open as a dedicated, full page view (not a popup/modal)**.
  - **Fully editable**:
    - Edit enquiry status (`open`, `quoted`, `closed`).
    - Edit internal notes.
    - Edit line item quantities.
    - Delete line items.
    - Add new items from the active company's catalog via a search picker dialog.
    - Real-time recalculation of subtotals.
    - Prominent CTA to **"Build / Convert to Quote"** (or "View Quote" if already converted).
- **Quote Builder Page View & Full Editing (`/biz/quotes/:enquiryId`)**:
  - **Must open as a dedicated, full page view (not a popup/modal)**.
  - Automatically converts the active company's enquiry items into a formal quotation if not already created, defaulting to revision `v1.0`.
  - **Fully editable**:
    - Edit quote status (`draft`, `sent`, `pending`, `approved`, `revision`, `cancelled`).
    - Edit line item names, quantities, unit prices, and discount percentages.
    - Add custom ad-hoc line items on the fly.
    - Add catalog items directly into the quote.
    - Delete line items.
    - Set Tax Rate Percentage (default 18%).
    - Custom Payment Terms and Client Notes.
    - Live financial summary: Subtotal, Total Discount, Tax Amount, Grand Total.
    - **Version Revisions**: Button to save current state as a new revision (e.g., `v1.1`, `v2.0`) with custom label (e.g., "Client requested 10% discount"). Revision dropdown switcher to review past revisions.
    - Action buttons: **"Preview / Print Document"** and **"Email Quote"** (which opens `mailto:` and automatically moves status from `draft` to `sent`).

### 3. `admin` (Platform Operator)
- **People Management (`/admin/people`)**:
  - Tabs for **Clients** and **Business Users**.
  - View joined date, email, phone, name.
  - Edit user names and phone numbers.
  - Delete user accounts (cascading cleanup).
- **Platform Enquiries (`/admin/enquiries`)**:
  - View all enquiries platform-wide.
  - Ability to click into the full enquiry page view (`/enquiries/:id/preview` or dedicated view).
  - Delete enquiry capability.
  - **Strict Rule**: Admin has view and delete access only; admin cannot edit enquiry line items or pricing.
- **Platform Quotes (`/admin/quotes`)**:
  - View all quotes across all companies.
  - Ability to click into the full quote page view (`/quotes/:id/preview`).
  - Delete quote capability.
  - **Strict Rule**: Admin has view and delete access only; admin cannot alter quote pricing, discounts, or terms.

---

## 2. Key Architecture & Data Rules

1. **Company Isolation**:
   - Each company belongs to a `business_user`.
   - Catalogs and items are strictly isolated per company.
   - A business user can only see and convert the line items belonging to their company.
2. **Multi-Company Cart & Enquiry Splitting**:
   - A client's cart can contain items from multiple different companies.
   - When submitted, exactly **one Enquiry** is created with multiple `enquiry_line_items` tagged by `company_id`.
   - Each vendor company converts only their slice into a separate **Quote** (`enquiry_id` + `company_id` unique pair).
   - If a client orders from 2 companies, 1 enquiry exists, producing up to 2 distinct quotes independently managed by the respective business owners.
3. **Dedicated Page Views (Not Modals)**:
   - Enquiries and Quotes must open in comprehensive, dedicated page views with full breadcrumbs, clear layout, and intuitive inline editing controls.
4. **Printable Document Views**:
   - `/quotes/:quoteId/preview` and `/enquiries/:enquiryId/preview` provide clean, clean document layouts with printable styling (`@media print` hides navigation chrome and buttons).

---

## 3. Database Schema

Design PostgreSQL tables (e.g., Supabase / Neon):

```sql
-- 1. Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'business_user', 'client')),
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);

-- 2. Companies (owned by business users)
create table companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 3. Categories (Product vs Service)
create table categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  type text not null check (type in ('product', 'service')),
  name text not null,
  created_at timestamptz not null default now()
);

-- 4. Catalog Items
create table catalog_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  type text not null check (type in ('product', 'service')),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  unit text, -- e.g., 'pcs', 'day', 'hour', 'sqft'
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. Enquiries
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'quoted', 'closed')),
  notes text,
  created_at timestamptz not null default now()
);

-- 6. Enquiry Line Items
create table enquiry_line_items (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  catalog_item_id uuid not null references catalog_items(id),
  company_id uuid not null references companies(id),
  quantity integer not null default 1 check (quantity > 0),
  notes text,
  created_at timestamptz not null default now()
);

-- 7. Quotes (1 per Enquiry-Company pair)
create table quotes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  business_user_id uuid not null references users(id),
  status text not null default 'draft' check (status in ('draft', 'sent', 'pending', 'approved', 'cancelled', 'revision')),
  tax_rate_percent numeric(5,2) not null default 18,
  terms text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enquiry_id, company_id)
);

-- 8. Quote Line Items
create table quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  enquiry_line_item_id uuid references enquiry_line_items(id),
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  discount_percent numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 9. Quote Revisions
create table quote_revisions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  version text not null, -- e.g., 'v1.0', 'v1.1'
  label text,            -- e.g., 'Initial draft', 'Revised discount'
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
```

---

## 4. UI/UX & Page Layout Map

### A. Public Marketplace Layout (`/marketplace`)
- **Header**: Brand logo, Marketplace link, My Enquiries (if client signed in), Cart icon badge with item count, Login / Sign Up / Avatar dropdown.
- **Routes**:
  - `/marketplace`: Cards grid of all registered companies with name, description, and link to company store.
  - `/marketplace/:companyId`: Company profile banner, Product/Service tabs, categories sidebar/filter, item cards with price, unit, and "Add to Cart" button with animated feedback.
  - `/cart`: Grouped list of items by vendor company, quantity increment/decrement, line subtotal, estimated order total, and "Proceed to Checkout" button.
  - `/checkout`: Summary of items and total. If unauthenticated, displays integrated account registration form (Name, Email, Password). Optional enquiry notes input. "Confirm & Submit Enquiry" button.
  - `/my-enquiries`: Client's personal order history. Accordion or card list showing date, status badge, items per company, and "View Quote" button once vendor has generated a quote.

### B. Internal Application Layout (Sidebar + Topbar for Admin & Business User)
- **Sidebar**:
  - Brand Logo: "EQ" Enquiry to Quotation.
  - For **Business User**:
    - Companies (`/companies`)
    - Catalog (`/catalog`)
    - Enquiries (`/biz/enquiries`)
  - For **Admin**:
    - People (`/admin/people`)
    - Enquiries (`/admin/enquiries`)
    - Quotes (`/admin/quotes`)
  - Active Company Selector (dropdown in sidebar or top bar for business user).
- **Topbar**: Search shortcut (⌘K), Notifications bell icon, User Avatar with initials, Role badge, and Logout dropdown.

### C. Dedicated Page Views & Detailed Specs

#### 1. Business User: Dedicated Enquiry Detail Page (`/biz/enquiries/:enquiryId`)
- **Breadcrumb Navigation**: `← Back to Enquiries`
- **Header**:
  - Client Full Name, Email, Phone number badge.
  - Date and time received.
  - Status Dropdown Selector (`open`, `quoted`, `closed`) with instant save.
- **Editable Line Items Table**:
  - Columns: Item Name, Unit, Unit Price, Quantity (editable input with blur auto-save), Subtotal, Actions (Delete item button).
  - Button: **"+ Add Item from Catalog"** opens a quick catalog search modal to pick and add extra items to the enquiry.
- **Enquiry Notes Section**:
  - Editable multiline textarea for client's notes and internal business notes.
- **Actions Bar**:
  - Subtotal calculation banner.
  - Primary button: **"Convert to Quotation"** (if no quote exists) or **"Open Quotation Builder →"** (if already converted).
  - Secondary button: **"Print / Preview Enquiry"**.

#### 2. Business User: Dedicated Quotation Builder Page (`/biz/quotes/:enquiryId`)
- **Breadcrumb Navigation**: `← Back to Enquiry`
- **Header**:
  - Quote Number (e.g. `QT-A1B2C3D4`), Client details, Creation date.
  - Status Dropdown: `draft`, `sent`, `pending`, `approved`, `revision`, `cancelled`.
  - Current Revision Badge (e.g., `v1.0 (Original)`).
- **Line Items Editor**:
  - Columns:
    - Item Name (editable text input)
    - Quantity (editable number input)
    - Unit Price (editable number input in INR ₹)
    - Discount % (editable number input, 0–100%)
    - Total (calculated live: `quantity * unitPrice * (1 - discount/100)`)
    - Delete button
  - Action buttons:
    - **"+ Add Catalog Item"**: Picker from active company catalog.
    - **"+ Add Custom Line Item"**: Appends an empty row for custom fees, shipping, or bespoke services.
- **Financial Calculation Summary Card**:
  - Subtotal (sum of discounted items)
  - Tax Rate input (default 18%, editable)
  - Computed Tax Amount
  - Grand Total in large bold typography
- **Terms & Notes**:
  - Payment Terms textarea (e.g., "50% advance, 50% on completion").
  - Internal / Client remarks textarea.
- **Revision Control Bar**:
  - Button **"Save as New Revision"**: Opens dialog asking for version tag (e.g., `v1.1`) and label (e.g., "Adjusted discount for corporate volume").
  - Revision history selector dropdown to switch between snapshots.
- **Document Actions**:
  - **"Preview Document"**: Navigates to `/quotes/:quoteId/preview`.
  - **"Email to Client"**: Prompts to send quote link via `mailto:` and auto-sets status to `sent`.

#### 3. Client & Public Document View: Dedicated Preview Page (`/quotes/:quoteId/preview`)
- Full page view styled like a luxury commercial invoice/quotation.
- Vendor Company header with logo/branding, contact info.
- Client details bill-to section.
- Clean line-item breakdown with quantity, unit rate, discount, and totals.
- Subtotal, GST/Tax breakdown, and Grand Total.
- Terms & Conditions, validity date.
- Header toolbar (hidden when printing) with **"Print / Save PDF"** and **"Back"** buttons.

---

## 5. Complete Inventory of All 17 Pages & Route Map

Ensure your app implements all 17 distinct pages with their specific routes and access controls:

| # | Page Name | Exact Route | Target Role | Page Purpose & Detailed Functionality |
|---|---|---|---|---|
| 1 | **Marketplace Directory** | `/marketplace` | Public / All | **Browse Vendors**: Grid of company cards showing name, description, and link to company store. |
| 2 | **Company Storefront** | `/marketplace/:companyId` | Public / All | **Browse Products & Services**: Company profile, Product/Service tabs, categories filter, and catalog cards with prices, units, and "Add to Cart" button. |
| 3 | **Enquiry Cart** | `/cart` | Public / All | **Review Multi-Company Cart**: Grouped cart items by vendor company with qty +/- controls, line totals, estimated summary, and checkout button. |
| 4 | **Checkout & Signup** | `/checkout` | Public / All | **Enquiry Submit & 1-Step Signup**: Order summary. Unauthenticated users fill Name, Email, Password. Add notes, and click "Submit Enquiry". |
| 5 | **My Enquiries** | `/my-enquiries` | `client` | **Client Order History**: Past enquiries list with date, status (`open`, `quoted`, `closed`), item lists per company, and "View Quote" link when issued. |
| 6 | **Companies Manager** | `/companies` | `business_user` | **Vendor Companies**: List, create, edit, or delete companies owned by user. Sets the "Active Company" that scopes the catalog, inbox, and quotes. |
| 7 | **Catalog Builder** | `/catalog` | `business_user` | **Active Company Catalog**: Product and Service tabs, custom category creation/deletion, item cards with price, unit, and active/inactive toggle. |
| 8 | **Enquiries Inbox** | `/biz/enquiries` | `business_user` | **Company Enquiry Inbox**: Table of client enquiries touching the active company. Includes "+ Add Enquiry for Client" button to log manual client enquiries. |
| 9 | **Dedicated Enquiry Detail** | `/biz/enquiries/:enquiryId` | `business_user` | **Full Dedicated Enquiry Page View (Editable)**: Client contact info, editable status (`open`/`quoted`/`closed`), editable line item quantities, delete line items, add items from catalog dialog, internal notes, and "Build / Convert to Quote" CTA. |
| 10 | **Dedicated Quotation Builder** | `/biz/quotes/:enquiryId` | `business_user` | **Full Dedicated Quote Editor Page View (Editable)**: Editable line items (name, qty, unit price ₹, discount %), add catalog items, add custom line items, tax % (default 18%), payment terms, remarks, status switcher, version revisions (`v1.0`, `v1.1`), and "Email Quote" button. |
| 11 | **Admin People** | `/admin/people` | `admin` | **User Governance**: Tabs for Clients and Business Users. View accounts, joined dates, edit names/phones, or delete user accounts. |
| 12 | **Admin Enquiries** | `/admin/enquiries` | `admin` | **Platform Enquiries Audit**: Global table of all enquiries across all clients and companies. Expandable item lists and delete action (view & delete only, cannot edit content). |
| 13 | **Admin Quotes** | `/admin/quotes` | `admin` | **Platform Quotes Audit**: Global table of all quotes across all companies. Company-to-client mapping, line items, and delete action (view & delete only). |
| 14 | **Quotation Preview Document** | `/quotes/:quoteId/preview` | `client`, `business_user`, `admin` | **Printable Commercial Quote**: Clean invoice document layout with company header, client bill-to, line item table, tax breakdown, terms, "Print / Save PDF", and "Email Quote" `mailto:` action. |
| 15 | **Enquiry Preview Document** | `/enquiries/:enquiryId/preview` | `client`, `business_user`, `admin` | **Printable Enquiry Document**: Clean enquiry document layout with client info, requested items grouped by company, and browser print/PDF support. |
| 16 | **Login & Business Signup** | `/login` | Public / Unauthed | **Authentication**: Tab/mode to sign in with email/password or create a new Business User account. Redirects already authenticated sessions. |
| 17 | **Smart Entry Home Redirect** | `/` | Internal Authed | **Role-Based Redirector**: Immediately redirects `admin` to `/admin/people` and `business_user` to `/companies` (while `client` is kept in `/my-enquiries`). |

---

## 6. Design System & Aesthetics Guidelines

- **Typography**: Clean modern sans-serif like `Manrope` or `Inter`.
- **Palette**: Warm luxury neutral palette:
  - Cream background: `#FBF7EF` (subtle cream-soft: `#F4EEE0`, border deep: `#EDE4D0`)
  - Charcoal text: `#221F1A` (soft charcoal: `#57534A`, muted: `#918C7D`)
  - Gold accent: `#C9962F` (light gold: `#F4E3C1`, soft gold: `#F9EFD9`, gold dark: `#A5791F`)
  - Status tokens: Success (`#2F9E5B`), Danger (`#D1493F`), Info (`#3F7FD1`), Warning (`#C9962F`)
- **Card styling**: Generous border-radius (`1.375rem`), subtle borders (`border-black/[0.04]`), soft ambient elevation shadows (`shadow-soft` and `shadow-soft-lg`).
- **Micro-interactions**: Smooth button hover scale (`hover:-translate-y-0.5`), toast alerts on save actions, badge color-coding per status.

---

## 7. Testing & Demo Credentials

Pre-seed the database or provide an initialization script with:
- **Admin**: `admin@demo.com` / `DemoAdmin123!`
- **Business User**: `vendor@demo.com` / `DemoVendor123!` (with a pre-populated company and product/service catalog items)
- **Client**: `client@demo.com` / `DemoClient123!` (with sample past enquiries)

