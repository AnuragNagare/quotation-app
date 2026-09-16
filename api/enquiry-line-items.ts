import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db.js";
import { requireRole, requireSession } from "./_lib/auth.js";

async function ownsCompany(userId: string, companyId: string): Promise<boolean> {
  const rows = await sql`select 1 from companies where id = ${companyId} and owner_id = ${userId}`;
  return rows.length > 0;
}

async function ownsLineItemCompany(userId: string, lineItemId: string): Promise<boolean> {
  const rows = await sql`
    select 1 from enquiry_line_items eli
    join companies co on co.id = eli.company_id
    where eli.id = ${lineItemId} and co.owner_id = ${userId}
  `;
  return rows.length > 0;
}

// Returns enquiry line items joined with catalog item + company names, scoped
// by role: a client only ever sees rows from their own enquiries, a business
// user only ever sees rows for companies they own, admin sees everything.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const session = requireSession(req, res);
      if (!session) return;

      const enquiryIdsParam = req.query.enquiryIds as string | undefined;
      if (!enquiryIdsParam) {
        res.status(200).json({ items: [] });
        return;
      }
      const enquiryIds = enquiryIdsParam.split(",").filter(Boolean);
      if (enquiryIds.length === 0) {
        res.status(200).json({ items: [] });
        return;
      }

      const rows = await sql`
        select
          eli.*,
          ci.name as "catalogItemName",
          ci.unit as "catalogItemUnit",
          ci.price as "catalogItemPrice",
          co.name as "companyName",
          co.owner_id as "companyOwnerId",
          e.client_id as "enquiryClientId"
        from enquiry_line_items eli
        join catalog_items ci on ci.id = eli.catalog_item_id
        join companies co on co.id = eli.company_id
        join enquiries e on e.id = eli.enquiry_id
        where eli.enquiry_id = any(${enquiryIds})
      `;

      const scoped = rows.filter((row: Record<string, unknown>) => {
        if (session.role === "admin") return true;
        if (session.role === "client") return row.enquiryClientId === session.sub;
        if (session.role === "business_user") return row.companyOwnerId === session.sub;
        return false;
      });

      res.status(200).json({ items: scoped });
      return;
    }

    if (req.method === "POST") {
      const session = requireRole(req, res, ["business_user"]);
      if (!session) return;
      const { enquiryId, catalogItemId, companyId, quantity } = req.body as {
        enquiryId?: string;
        catalogItemId?: string;
        companyId?: string;
        quantity?: number;
      };
      if (!enquiryId || !catalogItemId || !companyId) {
        res.status(400).json({ error: "Missing fields" });
        return;
      }
      if (!(await ownsCompany(session.sub, companyId))) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const enquiryExists = await sql`select 1 from enquiries where id = ${enquiryId}`;
      if (enquiryExists.length === 0) {
        res.status(404).json({ error: "Enquiry not found" });
        return;
      }
      const id = randomUUID();
      const rows = await sql`
        insert into enquiry_line_items (id, enquiry_id, catalog_item_id, company_id, quantity)
        values (${id}, ${enquiryId}, ${catalogItemId}, ${companyId}, ${quantity ?? 1})
        returning *
      `;
      res.status(201).json({ item: rows[0] });
      return;
    }

    if (req.method === "PATCH") {
      const session = requireRole(req, res, ["business_user"]);
      if (!session) return;
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      if (!(await ownsLineItemCompany(session.sub, id))) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const { quantity } = req.body as { quantity?: number };
      if (!quantity || quantity < 1) {
        res.status(400).json({ error: "Invalid quantity" });
        return;
      }
      const rows = await sql`
        update enquiry_line_items set quantity = ${quantity} where id = ${id} returning *
      `;
      res.status(200).json({ item: rows[0] });
      return;
    }

    if (req.method === "DELETE") {
      const session = requireRole(req, res, ["business_user"]);
      if (!session) return;
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      if (!(await ownsLineItemCompany(session.sub, id))) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      await sql`delete from enquiry_line_items where id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
