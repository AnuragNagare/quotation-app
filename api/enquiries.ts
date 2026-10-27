import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

import { sql } from "./_lib/db.js";
import { getSession, requireRole, requireSession } from "./_lib/auth.js";

interface EnquiryItemInput {
  catalogItemId: string;
  companyId: string;
  quantity: number;
}

async function ownsEnquiryAsBusiness(userId: string, enquiryId: string): Promise<boolean> {
  const rows = await sql`
    select 1 from enquiry_line_items eli
    join companies co on co.id = eli.company_id
    where eli.enquiry_id = ${enquiryId} and co.owner_id = ${userId}
  `;
  return rows.length > 0;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PUBLIC_ITEMS = 100;
const MAX_PUBLIC_QUANTITY = 100000;

// Open (no-login) enquiry from a company's public page. The visitor leaves a
// name + phone number; we attach the enquiry to a "guest" client account keyed
// by phone number so repeat enquiries from the same number group together and
// the business user can see them in their normal Clients / Enquiries views.
// A signed-in client submitting here is attached to their own account instead.
async function handlePublicEnquiry(req: VercelRequest, res: VercelResponse) {
  const { companyId, name, companyName, phone, location, deliveryDate, notes, items } = req.body as {
    companyId?: string;
    name?: string;
    companyName?: string;
    phone?: string;
    location?: string;
    deliveryDate?: string;
    notes?: string;
    items?: { catalogItemId?: string; quantity?: number }[];
  };

  const cleanName = name?.trim();
  const cleanLocation = location?.trim();
  const digits = (phone ?? "").replace(/\D/g, "");

  if (!companyId || !UUID_RE.test(companyId)) {
    res.status(400).json({ error: "Invalid company" });
    return;
  }
  if (!cleanName) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  if (digits.length < 7 || digits.length > 15) {
    res.status(400).json({ error: "Enter a valid phone number" });
    return;
  }
  if (!cleanLocation) {
    res.status(400).json({ error: "Location is required" });
    return;
  }
  if (!deliveryDate || !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
    res.status(400).json({ error: "Date of delivery is required" });
    return;
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_PUBLIC_ITEMS) {
    res.status(400).json({ error: "Select at least one product or service" });
    return;
  }

  // Merge duplicate lines and validate shape.
  const quantities = new Map<string, number>();
  for (const item of items) {
    const id = item.catalogItemId;
    const qty = Number(item.quantity);
    if (
      !id ||
      !UUID_RE.test(id) ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > MAX_PUBLIC_QUANTITY
    ) {
      res.status(400).json({ error: "Invalid item or quantity" });
      return;
    }
    quantities.set(id, (quantities.get(id) ?? 0) + qty);
  }

  // Every item must be an active item of THIS company — never trust the browser.
  const ids = [...quantities.keys()];
  const found = await sql`
    select id from catalog_items
    where company_id = ${companyId} and is_active = true and id = any(${ids})
  `;
  if (found.length !== ids.length) {
    res.status(400).json({ error: "One or more items are no longer available" });
    return;
  }

  const session = getSession(req);
  const queries: ReturnType<typeof sql>[] = [];
  let clientId: string;

  if (session?.role === "client") {
    clientId = session.sub;
  } else {
    const email = `guest-${digits}@guest.local`;
    const existing = await sql`select id from users where email = ${email}`;
    if (existing.length > 0) {
      clientId = existing[0].id as string;
    } else {
      clientId = randomUUID();
      const passwordHash = await bcrypt.hash(randomUUID(), 10);
      queries.push(sql`
        insert into users (id, email, password_hash, role, full_name, phone)
        values (${clientId}, ${email}, ${passwordHash}, 'client', ${cleanName}, ${phone!.trim()})
      `);
    }
  }

  const enquiryId = randomUUID();
  queries.push(
    sql`
      insert into enquiries (id, client_id, notes, location, delivery_date, contact_name, contact_phone, client_company)
      values (
        ${enquiryId}, ${clientId}, ${notes?.trim() || null}, ${cleanLocation}, ${deliveryDate},
        ${cleanName}, ${phone!.trim()}, ${companyName?.trim() || null}
      )
    `,
    ...[...quantities].map(
      ([catalogItemId, quantity]) => sql`
        insert into enquiry_line_items (enquiry_id, catalog_item_id, company_id, quantity)
        values (${enquiryId}, ${catalogItemId}, ${companyId}, ${quantity})
      `
    )
  );
  await sql.transaction(queries);

  res.status(201).json({ id: enquiryId });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const scope = req.query.scope as string | undefined;

      if (scope === "mine") {
        const session = requireSession(req, res);
        if (!session) return;
        const rows = await sql`
          select * from enquiries where client_id = ${session.sub} order by created_at desc
        `;
        res.status(200).json({ enquiries: rows });
        return;
      }

      if (scope === "biz") {
        const session = requireRole(req, res, ["business_user"]);
        if (!session) return;
        const rows = await sql`
          select distinct e.* from enquiries e
          join enquiry_line_items eli on eli.enquiry_id = e.id
          join companies c on c.id = eli.company_id
          where c.owner_id = ${session.sub}
          order by e.created_at desc
        `;
        res.status(200).json({ enquiries: rows });
        return;
      }

      if (scope === "admin") {
        const session = requireRole(req, res, ["admin"]);
        if (!session) return;
        const rows = await sql`select * from enquiries order by created_at desc`;
        res.status(200).json({ enquiries: rows });
        return;
      }

      // Bulk-by-id lookup (e.g. resolving a quote's parent enquiry for its
      // client_id) — visibility mirrors the scoped listings above.
      const idsParam = req.query.ids as string | undefined;
      if (idsParam) {
        const session = requireSession(req, res);
        if (!session) return;
        const ids = idsParam.split(",").filter(Boolean);
        if (ids.length === 0) {
          res.status(200).json({ enquiries: [] });
          return;
        }

        let rows;
        if (session.role === "admin") {
          rows = await sql`select * from enquiries where id = any(${ids})`;
        } else {
          rows = await sql`
            select distinct e.* from enquiries e
            left join enquiry_line_items eli on eli.enquiry_id = e.id
            left join companies c on c.id = eli.company_id
            where e.id = any(${ids}) and (e.client_id = ${session.sub} or c.owner_id = ${session.sub})
          `;
        }
        res.status(200).json({ enquiries: rows });
        return;
      }

      res.status(400).json({ error: "Missing or invalid scope" });
      return;
    }

    if (req.method === "POST" && req.query.scope === "public") {
      await handlePublicEnquiry(req, res);
      return;
    }

    if (req.method === "POST") {
      const session = requireSession(req, res);
      if (!session) return;

      const { items, notes, onBehalfOfClientId, newClient, location, deliveryDate, contactName, contactPhone } =
        req.body as {
        items?: EnquiryItemInput[];
        notes?: string;
        location?: string;
        deliveryDate?: string;
        contactName?: string;
        contactPhone?: string;
        onBehalfOfClientId?: string;
        newClient?: { fullName?: string; email?: string; password?: string; phone?: string };
      };

      if (!items || items.length === 0) {
        res.status(400).json({ error: "At least one item is required" });
        return;
      }

      if (deliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
        res.status(400).json({ error: "Delivery date must be YYYY-MM-DD" });
        return;
      }

      let clientId: string;
      let newClientInsert: ReturnType<typeof sql> | null = null;

      if (onBehalfOfClientId) {
        if (session.role !== "business_user" && session.role !== "admin") {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        const found = await sql`
          select id from users where id = ${onBehalfOfClientId} and role = 'client'
        `;
        if (found.length === 0) {
          res.status(400).json({ error: "Client not found" });
          return;
        }
        clientId = onBehalfOfClientId;
      } else if (newClient) {
        if (session.role !== "business_user" && session.role !== "admin") {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        const { fullName, email, password, phone } = newClient;
        if (!fullName || !email || !password) {
          res.status(400).json({ error: "New client needs a name, email, and password" });
          return;
        }
        if (password.length < 6) {
          res.status(400).json({ error: "Password must be at least 6 characters" });
          return;
        }
        const existing = await sql`select id from users where email = ${email}`;
        if (existing.length > 0) {
          res.status(409).json({ error: "An account with this email already exists" });
          return;
        }
        clientId = randomUUID();
        const passwordHash = await bcrypt.hash(password, 10);
        newClientInsert = sql`
          insert into users (id, email, password_hash, role, full_name, phone)
          values (${clientId}, ${email}, ${passwordHash}, 'client', ${fullName}, ${phone || null})
        `;
      } else {
        // Self-checkout by the logged-in user (client, business user, or admin)
        clientId = session.sub;
      }

      const enquiryId = randomUUID();
      const queries = [
        ...(newClientInsert ? [newClientInsert] : []),
        sql`
          insert into enquiries (id, client_id, notes, location, delivery_date, contact_name, contact_phone)
          values (
            ${enquiryId}, ${clientId}, ${notes || null},
            ${location?.trim() || null}, ${deliveryDate || null},
            ${contactName?.trim() || null}, ${contactPhone?.trim() || null}
          )
        `,
        ...items.map(
          (item) =>
            sql`
              insert into enquiry_line_items (enquiry_id, catalog_item_id, company_id, quantity)
              values (${enquiryId}, ${item.catalogItemId}, ${item.companyId}, ${item.quantity})
            `
        ),
      ];
      await sql.transaction(queries);

      res.status(201).json({ id: enquiryId });
      return;
    }

    if (req.method === "PATCH") {
      const session = requireSession(req, res);
      if (!session) return;
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      if (session.role === "business_user") {
        if (!(await ownsEnquiryAsBusiness(session.sub, id))) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
      } else if (session.role !== "admin") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const existingRows = await sql`select * from enquiries where id = ${id}`;
      const existing = existingRows[0];
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const patch = req.body as { status?: string; notes?: string | null };
      const merged = {
        status: patch.status ?? existing.status,
        notes: "notes" in patch ? patch.notes : existing.notes,
      };
      const rows = await sql`
        update enquiries set status = ${merged.status}, notes = ${merged.notes}
        where id = ${id}
        returning *
      `;
      res.status(200).json({ enquiry: rows[0] });
      return;
    }

    if (req.method === "DELETE") {
      const session = requireRole(req, res, ["admin"]);
      if (!session) return;
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      await sql`delete from enquiries where id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
