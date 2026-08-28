# Roxy Platform — "Enquiry-First" Pivot: Implementation Plan

Status: **Phases 0–7 below are DONE and live** (the enquiry-first pivot itself, originally built on Supabase 2026-08-19). The backend has since moved to Neon (§0), and the role model briefly detoured to single-admin-only before being reverted. This doc's §0 is the current source of truth for what's actually running; §1–§11 below are the original planning doc, kept as a historical build log — read them for *how* something was built and *why*, not for current tech specifics (table names, RLS, Supabase Auth calls) which no longer apply verbatim.

Source spec: user message, 2026-08-19 ("Enquiry first Approach" doc) + follow-up answers (multi-company carts, isolated companies, single currency/tax, admin can view enq/quote).

---

## 0. Status as of 2026-08-28 — read this first

**Stack today**: React 19 + Vite SPA, unchanged. Backend is **Neon serverless Postgres** (`@neondatabase/serverless`) + **Vercel serverless functions** (`api/*.ts`) + **custom cookie-based JWT auth** (`jsonwebtoken`/`bcryptjs`) — not Supabase, not RLS. Every table from §4/§9 below exists, just without the `roxy_` prefix (`users`, `companies`, `categories`, `catalog_items`, `enquiries`, `enquiry_line_items`, `quotes`, `quote_line_items`, `quote_revisions`), and authorization is enforced per-endpoint in `api/*.ts` (ownership joins like `ownsCompany`/`ownsQuoteCompany`) instead of Postgres policies.

**Timeline since the original 2026-08-19 build** (see `git log` for exact commits):
1. `46019f2` — migrated Supabase → Neon + custom JWT auth (mechanical re-implementation, same three-role model and routes as Phases 0–7 below).
2. `22da972` (2026-08-25) — restructured to a **single-admin-role** model: `business_user`/`client` roles removed, a standalone `clients` contacts table replaced client accounts, checkout became fully anonymous, "active company" concept removed, product renamed **"Enquiry to Quotation"**.
3. `bed9fa8` (2026-08-28, today) — **reverted** the single-admin restructure: `business_user`/`client` roles, per-company ownership scoping, and the active-company concept are all back, matching Phases 0–7's original role model almost exactly. `scripts/migrate-restore-roles.mjs` folded the standalone `clients` table back into `users`. What was **kept** from the restructure: the "Enquiry to Quotation" name/branding (`EQ` logo, `etq_session` cookie, `etq_cart_v1`/`etq_active_company_id` storage keys), the company-edit dialog, category/company delete-confirmation dialogs, and a corrected `.env.example`.

**Net effect**: the app you're looking at today implements the same spec as Phases 0–7 below, on a different backend, under a different product name. Nothing in §1–§4 (roles, data model, core flows) needs to change — it's still accurate. §5 and §9's Supabase-specific mechanics (RLS policies, `roxy_private` helper functions, Supabase Auth calls, `roxy_`-prefixed tables) are superseded; the Neon equivalents are described in the memory file `roxy_neon_implementation.md`, not repeated here.

## 0.1 What's actually left to do

Ranked by how much it hurts today:

1. **Clients can never see a quote — the core loop is broken.** `src/pages/MyEnquiries.tsx` only calls `listMyEnquiries` + `listLineItemsForEnquiries`; it never calls `getQuoteByEnquiryAndCompany` or lists quotes at all. So when a business user builds a quote in `BizQuoteBuilder.tsx` and clicks "Send Quote" (status → `sent`), the client's own enquiries page still shows the *original enquiry* line items at catalog price — no quote status, no tax, no discounts, no revised pricing, nothing. A client currently has no way to know a quote exists, let alone approve/reject it. **Fix**: in `MyEnquiries.tsx`, for each `(enquiry, company)` pairing found in the enquiry's line items, fetch the quote via `getQuoteByEnquiryAndCompany(enquiry.id, companyId)` (already exists in `src/lib/quotes.ts`) and render its status/line items/total instead of (or alongside) the raw enquiry line items once a quote exists.
2. **Migrated client accounts can't log in.** `scripts/migrate-restore-roles.mjs` gave every client folded back from the old `clients` table a random, unknown-to-anyone password hash (see the script's own header comment). There is no password-reset flow anywhere in the app. Until one exists, those specific accounts are locked out — either build a minimal "forgot password" flow (email a reset token, new `api/` endpoint) or, as a stopgap, document the direct-SQL procedure to set a known password hash for a given email.
3. **No admin bootstrap path.** `api/auth.ts`'s signup endpoint explicitly rejects `role: "admin"` (only `client`/`business_user` are self-service). There's no script analogous to `scripts/migrate-restore-roles.mjs` for "promote this email to admin" — right now that requires a hand-written SQL `update` against Neon. Worth a tiny `scripts/promote-admin.mjs` (takes an email, sets `role='admin'`) so this isn't tribal knowledge.
4. **No password-reset flow at all**, for any role — compounds gap #2 and is a normal expectation for any real login system.
5. **The 2026-08-28 revert hasn't been browser-verified.** Every phase in §9 below ends with an "verified end-to-end in the browser" bullet — the revert commit's message doesn't include one, and no verification happened in this conversation either. Before trusting the current 3-role flow in production, walk through: business-user signup → create company → build catalog → (separately) client signup-at-checkout with a multi-company cart → business user converts + edits + sends a quote per company → admin views/edits/deletes across people/enquiries/quotes. Watch specifically for regressions in the ownership-scoping joins (`ownsCompany`, `ownsQuoteCompany`, etc. in `api/*.ts`), since those are exactly what the single-admin restructure had ripped out and the revert had to re-add.
6. **Cross-company cart UX risk** (carried over from §10 below, still unresolved and now sharper given gap #1): one checkout can spawn up to N separate quotes (one per company touched), but there is still no unified "here's where each company's quote stands" view for the client — building that is the natural extension of the MyEnquiries fix in gap #1, not a separate feature.
7. **Dashboard/Reports/FollowUps/Invoices/Analytics still have no defined role in this model** (§10/§11 below flagged this in the original plan; it's still true 9 days later). `Home.tsx` just redirects business_user→`/companies` and admin→`/admin/people` — there is no landing dashboard for either role. Decide explicitly: build a minimal one (enquiry/quote counts, recent activity) or confirm these stay out of scope permanently, so it stops being an open question.
8. **Stale docs.** `README.md` is still the generic `create-vite` template — should at minimum name the app, describe the three roles, and list the env vars from `.env.example`. This `plan.md` was stale until this update; keep §0 current going forward instead of letting drift accumulate again.
9. **No automated tests exist anywhere in the repo** — every verification in §9 below was manual browser testing. Given how much churn this app has already had (Supabase→Neon, single-admin→3-role and back) in 9 days, even a thin smoke-test layer around the `api/*.ts` ownership checks (the actual security boundary, per `roxy_neon_implementation.md`) would catch the next regression before a revert-worthy incident.
10. **Divergent `neon-migration` git branch** exists alongside `main` — worth checking whether it still has unique content to merge or can just be deleted, so it doesn't become a stale trap for a future session.

---

## 1. What we're building

Three roles:

- **Admin** — platform operator. Manages accounts, not content.
- **Business User** ("User") — owns one or more **Companies**, each with its own catalog. Manages the enquiry→quote lifecycle for their own company/companies.
- **Client** — the visitor/buyer. Self-service: browses catalog(s) cart-style, checks out to create an account, and submits the enquiry in one motion.

Core inversion vs. today: enquiries are **client-initiated first**, not staff-entered against a pre-existing customer. A Business User can still log an enquiry on a client's behalf, but the enquiry exists before it's attached to a client record.

## 2. Removed vs. kept vs. new

| | |
|---|---|
| **Removed entirely** | Hotels, Events (dispatch/packing/logistics), the `ClientType` hotel/direct EOM-batch billing split |
| **Kept, reshaped** | Customers → **Clients** (self-service, no more direct/hotel split baked into the type); Enquiries; Quotations |
| **New** | Companies, Catalog (Type → Category → Item), Admin role, real auth, cart/checkout flow, per-company enquiry splitting |
| **Undecided fate (spec is silent)** | Dashboard, Reports, FollowUps, Invoices, Analytics — none of these are mentioned in the new spec. Treated as **post-core-pivot** work; see §9 Phase 5. |

## 3. Roles & permissions matrix

| Action | Admin | Business User | Client |
|---|---|---|---|
| Manage own company/catalog | — | ✅ (own companies only) | — |
| Add client | — | ✅ | — (creates own account at checkout) |
| Build enquiry cart / checkout | — | ✅ (on behalf of a client) | ✅ (own cart) |
| Convert enquiry → quote | — | ✅ (only for items belonging to own company) | — |
| Create/update/send quote | — | ✅ (own company's quotes only) | — |
| View own past enquiries | — | ✅ (own company's) | ✅ (own) |
| Update client profile | ✅ | — | ✅ (own profile) |
| Update business-user profile | ✅ | ✅ (own) | — |
| Delete client / enquiry / quote / user | ✅ | — | — |
| Edit enquiry / quote **content** | ❌ (view-only) | ✅ (own) | — |

Key constraint: **Admin can view but never edit enquiry/quote content** — only delete, or edit the surrounding client/user profile.

## 4. Data model

```
BusinessUser (1) ──owns──▶ (N) Company               [companies fully isolated from each other —
                                │                       separate catalogs, separate client visibility]
                                ├──▶ CatalogType        {Product, Service}  (fixed enum per assumption, §6)
                                │        └──▶ Category  (custom, multiple per type, business-user-defined)
                                │                 └──▶ CatalogItem (product or service, priced)
                                │
                                └──▶ Quote (N)  ── scoped to this company only

Client (1) ──raises──▶ Enquiry (N)
Enquiry (1) ──has──▶ EnquiryLineItem (N)   [each line item references exactly one CatalogItem,
                                             and therefore exactly one Company]
Enquiry (1) ──splits into──▶ Quote (N)     [at most one active Quote per (Enquiry, Company) pair —
                                             a Business User only ever sees/converts the slice of an
                                             enquiry that touches their own company]
Quote (1) ──has──▶ QuoteLineItem (N) + QuoteRevision (N)   [revision history, same idea as today's
                                                             QuotationRevisionEntry]
Admin — no owned entities; cross-cutting permissions only
```

Why enquiries split per company: since a client's cart can span multiple companies (confirmed) but companies are fully isolated per Business User (confirmed), one `Enquiry` is the client-facing record, while `Quote` is always scoped to a single company. A 3-company cart produces up to 3 quotes, each independently converted/sent by that company's Business User, but all trace back to one `Enquiry`.

Global (not per-company): currency and tax rate — confirmed single/global, matches today's hardcoded INR/GST-style `SystemSettings`. No per-company tax config needed.

## 5. Tech & architecture decisions

**The current app cannot support this pivot as-is.** It's a Vite SPA with zero backend, zero auth, and all state in `mockData.ts` / in-memory React Context. Three real roles with real permission boundaries (a Business User must never see another company's catalog or clients; a Client must never see another client's enquiries) cannot be enforced client-side — this requires a real backend with server-side authorization.

**Recommendation:** keep the existing Vite + React SPA shell (routing, design system, component library are all reusable) and add a **Supabase** backend (Postgres + Auth + Row Level Security). Rationale:
- Multi-tenant isolation (Company-scoped data, Client-scoped enquiries) maps directly onto Postgres RLS policies keyed on `auth.uid()` — no custom authorization server needed.
- Supabase Auth covers the three-role login (Admin / Business User / Client) with custom claims or a `role` column, plus the Client self-service signup-at-checkout flow.
- Avoids a full framework migration (Vite → Next.js) just to get a backend — lower risk, incremental.
- Alternative considered: migrate to Next.js App Router + a Vercel-marketplace Postgres/auth integration. More "platform-native" but is a bigger rewrite for no functional gain here, since this app doesn't need SSR/edge rendering. Revisit only if server-rendering or SEO for the public catalog becomes a requirement.

This is a decision point — flag for explicit sign-off before Phase 1 starts, but the plan below assumes Supabase.

## 6. Catalog hierarchy — assumption to confirm

Spec says: *"Type product or service. Manual and multiple Categories under type. Co / Type / category / product or service."*

Read as: **Type is a fixed two-value enum** (`Product` | `Service`), not a free-form field — a company's catalog splits into a Product branch and a Service branch, and under each, the Business User manually creates any number of Categories, and under each Category, the actual catalog items. This is the assumption baked into §4's data model. **Needs explicit confirmation before schema is finalized** — if "Type" is meant to be user-defined too (not just Product/Service), the model gains one more free-form level.

## 7. Core flows

**Client — cart to enquiry:**
1. Browse catalog (single company or cross-company view — TBD, likely a unified marketplace listing with company/category filters).
2. Add items from one or more companies to an enquiry cart.
3. Checkout: create profile + username (this is first-touch signup — no account exists before this point).
4. Submit → creates one `Enquiry` with `EnquiryLineItem`s, grouped internally by company.
5. Client can log in later and view their past enquiries (and, once quoted, the resulting quote(s)).

**Business User — company & catalog management:**
1. Sign up / log in, create Company (repeatable — owns N companies, fully isolated).
2. Build catalog: create Categories under Product/Service, add CatalogItems with pricing.
3. Add a Client directly, or log an enquiry on a client's behalf (enquiry created first, attached to new-or-existing client after — mirrors the client-side flow).
4. Dashboard/inbox of enquiries touching their company only.
5. Convert an enquiry's company-scoped line items into a Quote; edit line items/terms/tax; send to client.
6. Update/revise a sent quote (revision history, same UX pattern as today's `RevisionHistoryCard`).

**Admin:**
1. Log in to an admin-only view.
2. Browse/search Clients and Business Users; edit their profile fields.
3. Browse Enquiries/Quotes **read-only**; delete any of: client, business user, enquiry, quote.

## 8. Screens/routes — rough map

| Route (indicative) | Audience | Notes |
|---|---|---|
| `/` marketplace / catalog browse | Client (public) | New — replaces nothing directly |
| `/cart`, `/checkout` | Client | New |
| `/my/enquiries` | Client | Adapts `ViewEnquiryDrawer` idea into a page |
| `/biz/companies` | Business User | New — company switcher if they own >1 |
| `/biz/catalog` | Business User | Replaces `Equipment.tsx` + `EquipmentContext` pattern, generalized from single fixed catalog to per-company Type/Category/Item tree |
| `/biz/enquiries` | Business User | Adapts `Enquiries.tsx` filtered to own company |
| `/biz/quotations` | Business User | Reuses most of `Quotations.tsx` (`buildDraftFromEnquiry`, line items, tax, revisions, send dialog) almost as-is |
| `/biz/clients` | Business User | Adapts `CustomersView.tsx` (drop hotel segment, drop billing-cycle fields) |
| `/admin/*` | Admin | New — profile edit + view/delete only |
| ~~`/hotels`~~, ~~`/events`~~ | — | Deleted |
| `/login`, role-aware redirect | All | Replace no-op `Login.tsx` with real Supabase Auth |

`Dashboard`, `Reports`, `FollowUps`, `Invoices`, `Analytics` are left in place structurally but disconnected from the old hotel/event data until Phase 5 decides their new shape.

## 9. Implementation phases

*(Historical build log — Supabase-specific details below, e.g. `roxy_`-prefixed tables, RLS policies, `roxy_private` helper functions, and Supabase Auth calls are superseded by the Neon migration described in §0. The phase structure, verification steps, and bugs-found-and-fixed narrative are still an accurate record of what was built and when.)*

**Phase 0 — Decisions & setup** ✅ done (2026-08-19)
- [x] Confirm backend choice (Supabase, §5) and catalog "Type" assumption (§6) with user.
- [x] Provision Supabase backend — reused the account's existing project (`yfvgkmflykiawxftgrpf`, ap-south-1) since the free-tier project-creation quota was already maxed; isolated via `roxy_`-prefixed tables in `public` + a private `roxy_private` schema for RLS helper functions (never exposed via Data API), rather than mixing into the unrelated app's tables. Wired `@supabase/supabase-js` into the Vite app (`src/lib/supabaseClient.ts`), env vars in `.env.local`/`.env.example`.
- [x] Migrated initial schema (2 migrations: `roxy_core_schema`, `roxy_enquiries_and_quotes`): `roxy_profiles`, `roxy_companies`, `roxy_categories`, `roxy_catalog_items`, `roxy_enquiries`, `roxy_enquiry_line_items`, `roxy_quotes`, `roxy_quote_line_items`, `roxy_quote_revisions`. No separate `admins`/`clients`/`business_users` tables — single `roxy_profiles` table with a `role` check-constrained column, matching Supabase's standard one-row-per-`auth.users` pattern.
- [x] RLS policies on every table (security advisor run clean — zero issues on the new schema). Business User access is scoped via a `roxy_private.owns_company()` SECURITY DEFINER helper; Admin via `roxy_private.current_user_role()`; enforced "admin can view but never edit enquiry/quote content" by giving admin SELECT+DELETE policies only (no UPDATE) on `roxy_quotes`/`roxy_enquiries`.
- TypeScript types generated to `src/types/supabase.ts` (raw, regenerate after every migration) with clean app-facing aliases in `src/types/database.ts`.

**Phase 1 — Auth & roles** ✅ done (2026-08-19)
- [x] Replaced `Login.tsx` no-op with real Supabase Auth — sign-in, and a business-user sign-up path (client signup stays deferred to the future checkout flow per spec). `src/context/AuthContext.tsx` holds session/profile state and auto-creates a `roxy_profiles` row on first sign-in (`ensureProfile`, guarded by the RLS insert policy to `role in ('client','business_user')` — admin accounts can't be self-service created).
- [x] Route guarding: `src/components/auth/RequireAuth.tsx` redirects unauthenticated visitors to `/login` and signed-in users away from `/login`, wired into `App.tsx` around the existing `AppLayout` routes.
- [x] `Header.tsx` now shows the real signed-in profile (name/role) and a working Log out action.
- [x] Verified end-to-end in-browser: sign-up creates an auth user + profile row (confirmed via direct SQL), redirects into the app; log out returns to `/login`; log back in with the same credentials re-loads the same profile.
- [ ] Full per-role routing/dashboards (separate Admin/Business-User/Client shells) — deferred to Phases 2/4/5 below, which build the actual per-role screens. Today every authenticated user still sees the same legacy `AppLayout` nav.
- [ ] Client self-service signup embedded in checkout — deferred to Phase 3 (cart/checkout doesn't exist yet).

**Phase 2 — Business User: companies & catalog** ✅ done (2026-08-19)
- [x] Company CRUD: `src/pages/Companies.tsx` + `src/lib/companies.ts` + `src/context/CompanyContext.tsx` (holds the list of the signed-in business user's companies and the "active company," persisted in `localStorage`, that scopes the catalog view — multi-company switch via a `Select` when a user owns more than one).
- [x] Catalog builder: `src/pages/Catalog.tsx` + `src/lib/catalog.ts` + `src/components/catalog/CatalogItemFormDialog.tsx` — Product/Service tabs, category chips (add/delete) scoped to the active company + type, and a catalog-item table (add/edit/delete, price + unit + active toggle). Fully separate from the old `EquipmentContext`/`Equipment.tsx` (left untouched for now — cleanup is Phase 6).
- [x] Nav/route gating: `src/config/nav.ts` `NavItem.roles`, `src/components/auth/RequireRole.tsx`, `Sidebar.tsx` filters — "Companies"/"Catalog" only appear for `business_user`, and the routes 404-redirect anyone else to `/`.
- [x] Verified end-to-end in-browser with **two separate business-user accounts**: created "Roxy Audio Rentals" as user 1, added a "Speakers" category and a priced catalog item, confirmed the row in Postgres directly, edited it (active→inactive toggle persisted), then signed up a second business user and confirmed on a hard page load that their `/companies` and `/catalog` are completely empty — isolation (§4/§6 assumption) holds.
- **Bug found and fixed during this verification**: `AuthContext`'s initial session check set `loading = false` before the async profile fetch resolved, so a hard reload of a role-gated route (`/companies`) could see `loading: false, profile: null` for one render and bounce the user to `/` incorrectly. Also hardened `ensureProfile` against a duplicate-insert race (manual post-signup call vs. the `onAuthStateChange`-triggered call could both try to create the same profile row; the losing call now re-fetches instead of nulling out an already-loaded profile). Both fixes are in `src/context/AuthContext.tsx`.

**Phase 3 — Client: catalog, cart, checkout, enquiry** ✅ done (2026-08-19)
- [x] Public marketplace: `src/pages/Marketplace.tsx` (company grid) → `src/pages/MarketplaceCompany.tsx` (Product/Service tabs, active items only, "Add to cart"). Served under a separate `src/components/marketplace/MarketplaceLayout.tsx` (its own header — logo, cart badge, sign in/out), not the internal `AppLayout`. Works fully anonymously — `anon` role already had SELECT on companies/categories/catalog_items from Phase 0's RLS.
- [x] Cart: `src/context/CartContext.tsx`, `localStorage`-backed, line items carry `companyId` so a cart can span multiple companies (per the confirmed spec). `src/pages/Cart.tsx` groups by company with per-line qty edit/remove.
- [x] Checkout: `src/pages/Checkout.tsx` + `src/lib/enquiries.ts`. Anonymous visitor sees a signup form (name/email/password → `AuthContext.signUpClient`, new); already-authenticated client/business-user sees a plain confirm-and-submit. Enquiry + its (possibly multi-company) line items are created **atomically** via a new Postgres RPC `public.roxy_create_enquiry(items jsonb, notes text)` — `SECURITY INVOKER`, so it still runs under the normal RLS insert policies; avoids a partial enquiry-with-no-items if something fails mid-request.
- [x] `src/pages/MyEnquiries.tsx` — client's own enquiries (RLS-scoped to `client_id = auth.uid()`), grouped by company with line items and an estimated total.
- [x] Route/shell split: added `RequireInternalUser` (`src/components/auth/RequireAuth.tsx`) so a signed-in Client is bounced from the internal business shell (`/`, `/enquiries`, etc.) to `/my-enquiries` — the marketplace is now a genuinely separate surface from the Business User/Admin app, not just a set of unguarded routes.
- [x] Verified end-to-end in the browser: anonymous browse → add to cart → checkout-as-signup (new client "Priya Sharma" created) → enquiry landed in Postgres with correct line item; then a second cart→checkout cycle **while already signed in** (skips the signup form) confirmed the non-signup path too; confirmed a signed-in client hitting `/` is redirected to `/my-enquiries`.
- **Bugs found and fixed during this verification**:
  1. **RLS infinite recursion** — `roxy_enquiries`' business-user SELECT policy subqueried `roxy_enquiry_line_items`, whose client SELECT/INSERT policies subqueried back into `roxy_enquiries`, so Postgres rejected any query touching either table ("infinite recursion detected in policy for relation roxy_enquiries"). This surfaced immediately on the very first real enquiry submission. Fixed by adding two more `roxy_private` `SECURITY DEFINER` helper functions (`enquiry_client_id`, `enquiry_has_my_company_items`) that bypass RLS internally, same pattern as `owns_company`/`current_user_role` — migration `fix_enquiry_policy_recursion`.
  2. **Checkout redirect race** — `Checkout.tsx` used a render-time `if (items.length === 0) return <Navigate to="/cart"/>` guard; since a successful submit calls `clear()` on the cart *before* navigating to `/my-enquiries`, the guard re-fired on the resulting re-render and won the race, silently sending the user back to an empty `/cart` instead of their new enquiry. Fixed by moving the guard into a `useEffect` gated by a `justSubmittedRef`, so the "cart is empty, bounce away" behavior only applies to someone landing on `/checkout` directly, not to the post-submit clear.

**Phase 4 — Business User: enquiry → quote** ✅ done (2026-08-19)
- [x] Business User enquiry inbox: `src/pages/BizEnquiries.tsx`. Uses `listBizEnquiries()` (RLS already scopes to enquiries touching a company the caller owns) then further filters client-side down to the *active* company (a business user with multiple companies works one at a time, same UX pattern as Catalog). Shows client name, date, item count/subtotal (that company's slice only — cross-company enquiries never leak another company's items), and either a "Convert to Quote" button or the live quote-status badge.
- [x] "Add enquiry on behalf of client": `src/components/biz/AddEnquiryForClientDialog.tsx`, backed by a new RPC `roxy_business_create_enquiry` (client_id explicit, restricted to `business_user` role). Scoped to **existing clients only** — search-and-pick from `roxy_profiles`. **Known, deliberate gap**: creating a brand-new client inline isn't supported, since a client is a real Supabase Auth account and this app has no admin-style "create a user" flow; the spec's "new client" case is still only satisfiable via the marketplace checkout self-signup (Phase 3). Flagging this rather than faking a half-built inline account creation.
- [x] Enquiry → Quote conversion: new RPC `roxy_convert_enquiry_to_quote(enquiry_id, company_id, tax_rate_percent)` — atomic, idempotent (unique constraint on `(enquiry_id, company_id)` means re-clicking "Convert" just returns the existing quote), seeds `quote_line_items` from that company's `enquiry_line_items` with a price/name snapshot from the catalog, writes the `v1.0 Original` revision, and flips the enquiry's status to `quoted`.
- [x] Quote builder: `src/pages/BizQuoteBuilder.tsx` (route `/biz/quotes/:enquiryId`) — editable line items (name/qty/price/discount, add/remove), tax rate, terms, a status selector (draft/sent/pending/approved/revision/cancelled), a "Send Quote" action (status → sent; no real email — same simulated-action/toast pattern the rest of the app already uses, consistent with no email provider being in scope), and revision history with a "New Revision" action that snapshots a new version and marks it current.
- [x] Reused the existing UI kit (Button/Input/Select/Badge/Tabs) rather than adapting the legacy mock-data `Quotations.tsx` in place — built as new pages under `/biz/*` instead, same pattern as Phases 2–3. The old `/quotations` and `/enquiries` (mock) routes are left mounted but unlinked from nav for `business_user` (nav now points "Enquiries" at `/biz/enquiries`); full legacy removal stays Phase 6.
- [x] Verified end-to-end in the browser with real data: converted a real enquiry to a quote, edited price/added/removed line items with totals recalculating live, changed tax rate, saved terms, sent the quote (status + toasts), created a revision (v1.0 → v2.0, correctly re-marking current), and confirmed via direct SQL that the quote/line items/revisions/enquiry-status all persisted correctly. Also created an enquiry on behalf of an existing client and confirmed it appeared instantly in both the business user's inbox and that client's own `/my-enquiries` (cross-role visibility check).
- **Bug found and fixed**: `roxy_business_create_enquiry` (and, defensively, `roxy_create_enquiry`) used `insert ... returning id` — but Postgres RLS applies SELECT-policy visibility checks to `RETURNING` output too, and since the enquiry row is inserted *before* any of its line items exist, the business-user visibility policy (which depends on those line items) evaluated false at that exact instant, so Postgres raised "new row violates row-level security policy for table roxy_enquiries" on every business-initiated enquiry. Fixed by generating the UUID in SQL (`gen_random_uuid()`) and inserting it explicitly, so the functions never need `RETURNING` to learn the new id — migration `fix_enquiry_rpc_returning_rls`.

**Phase 5 — Admin panel** ✅ done (2026-08-19)
- [x] Admin views: `src/pages/AdminPeople.tsx` (Clients/Business Users tabs), `src/pages/AdminEnquiries.tsx` and `src/pages/AdminQuotes.tsx` (both platform-wide — every company's data, not scoped like the Business User views — with expand-to-view line items). Backed by `src/lib/admin.ts`.
- [x] Admin actions: edit profile (`src/components/admin/EditProfileDialog.tsx`, full name/phone — email read-only) and delete (`src/components/admin/ConfirmDeleteDialog.tsx`, reused across all three pages) for client/business-user/enquiry/quote, all enforced server-side by the admin RLS policies already written in Phase 0 (`profiles_update_admin`, `profiles_delete_admin`, `enquiries_delete_admin`, `quotes_delete_admin` — no corresponding *_update policy exists for enquiries/quotes, so admin edit access to their content is structurally impossible, not just hidden in the UI).
- [x] Route/nav gating: `/admin/people`, `/admin/enquiries`, `/admin/quotes` wrapped in `RequireRole roles={["admin"]}`; nav items gated the same way. Verified symmetric enforcement: an admin hitting `/companies` (business_user-only) redirects to `/`, and a business user hitting `/admin/people` also redirects to `/`.
- [x] **Admin bootstrap**: there is deliberately no self-service admin signup (RLS `profiles_insert_own` only allows `role in ('client','business_user')` on insert). Asked the user for explicit confirmation, then promoted an existing test account to `role='admin'` via a direct SQL update — this is also the real production bootstrap procedure for the platform's first admin, not just a test shortcut.
- [x] Verified end-to-end in the browser as the promoted admin: viewed Clients/Business Users tabs (correctly excluded the now-admin account from the Business Users list), edited a client's phone number and confirmed it persisted, viewed all enquiries/quotes platform-wide with expandable line items, deleted an enquiry with a confirmation dialog and confirmed via SQL that it cascade-deleted its line items (2 enquiries / 2 line items remaining afterward, matching expectations).

**Phase 6 — Cleanup & re-integration** ✅ done (2026-08-19)
- [x] Asked the user how to handle the pages with no spec-defined replacement (Dashboard, Reports, Follow Ups, Invoices, Analytics, Settings, Users) — confirmed: delete now rather than leave unlinked or rebuild.
- [x] Deleted **everything** mock-data-driven: Hotels, Events, Customers/CustomersView, the old mock Enquiries and Quotations pages (both fully superseded by `/biz/enquiries` and `/biz/quotes/:id`), Equipment (superseded by `/catalog`), plus Dashboard/Reports/FollowUps/Invoices/Analytics/Settings/SettingsView/Users/PlaceholderPage. Along with them: `src/components/{dashboard,enquiries,customers,events,equipment,invoices,reports,followups,quotations,settings}/` in full, `context/CustomerContext.tsx` + `context/EquipmentContext.tsx`, `lib/whatsapp.ts` + `lib/followups.ts`, and finally `data/mockData.ts` + the old `types/index.ts` — confirmed via grep *before* deleting that every remaining consumer of these was itself in the deletion set, so nothing real was left dangling.
- [x] Added `src/pages/Home.tsx` — `/` now redirects by role (business_user → `/companies`, admin → `/admin/people`; clients never reach it, already redirected by `RequireInternalUser`) instead of a shared dashboard that no longer exists.
- [x] Rewrote `App.tsx` and `config/nav.ts` down to only the real, Supabase-backed pages built in Phases 0–5 — `NavItem.roles` is no longer optional, every nav entry is explicitly role-scoped.
- [x] Verified: `tsc -b` clean, full `vite build` succeeds (666 kB bundle, down from carrying the whole legacy app), `oxlint` clean (only pre-existing fast-refresh warnings, unrelated to this change). Browser-tested all three roles post-cleanup — admin/business-user root-redirect to their respective home pages, client flow (marketplace/cart/my-enquiries) unaffected, no console errors beyond an unrelated Chrome-extension messaging artifact.
- **Result**: the repo now contains only the enquiry-first platform — no mock data, no hotel/event/equipment-rental leftovers, every page reads and writes real Supabase data.

**Phase 7 — Deploy** ✅ done (2026-08-19)
- [x] **Discovered and resolved a repo-structure problem before pushing**: the actual git repo root (`D:\Git hub project\Quotation`) had a separate, older copy of the pre-pivot app already committed there, while all of Phases 0–6 had been built in an untracked `New Quotation/` subfolder the whole session. Confirmed with the user, then replaced the root-level app with `New Quotation`'s contents (fresh `npm install` + `tsc -b` + `vite build` verified clean from the true root before committing), and gitignored the now-orphaned `New Quotation/` folder (couldn't delete it outright — the harness holds it open as this session's working directory).
- [x] Committed (145 files changed) and pushed to `main` on `https://github.com/AnuragNagare/quotation-app.git`.
- [x] Confirmed `vercel.json`'s SPA rewrite (`/(.*) → /index.html`) is still correct as-is — all auth gating is client-side React Router, nothing server-side to reconfigure.
- [x] Identified the linked Vercel project (`event-project`, confirmed with the user) via the Vercel MCP integration — but that integration has no env-var-write tool, and a fresh CLI/OAuth login just for two variables wasn't worth the friction, so handed the user the exact `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` values to paste into Vercel → Settings → Environment Variables themselves (neither value is secret — the publishable key is meant to be client-exposed, RLS is the real access boundary). User will add them and redeploy/await the next push-triggered build.

## 10. Open risks / questions

*(Status as of 2026-08-28 — see §0.1 for the actionable version of the still-open items.)*

- ~~Catalog "Type" enum vs. free-form (§6) — blocks schema finalization.~~ **Resolved**: shipped as the fixed two-value enum (`product`/`service`), confirmed in `src/types/database.ts`'s `CatalogType` and the Neon schema's `check (type in ('product','service'))` constraints.
- Cross-company cart UX: single checkout producing N quotes may confuse clients expecting "one enquiry, one answer" — **still open**, sharper now that gap §0.1 #1 (clients can't see quotes at all) is fixed first; a unified per-company-status view is the natural follow-on.
- No pricing/currency-per-company (confirmed global) simplifies quotes but means the platform can't onboard a company in a different currency later without a schema change — **still true**, acceptable per user's explicit answer, just noting the constraint.
- Dashboard/Reports/FollowUps/Invoices/Analytics have no defined role in the new model yet — **still open** 9 days later (§0.1 #7); needs an explicit decision, not another deferral.

## 11. Out of scope for v1

- Payments/billing (Invoices) — not mentioned in the enquiry-first spec at all.
- Per-company currency/tax.
- Anything hotel/event related.
