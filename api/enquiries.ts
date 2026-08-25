import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db.js";
import { requireRole } from "./_lib/auth.js";

interface EnquiryItemInput {
  catalogItemId: string;
  companyId: string;
  quantity: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const session = requireRole(req, res, ["admin"]);
      if (!session) return;

      const idsParam = req.query.ids as string | undefined;
      if (idsParam) {
        const ids = idsParam.split(",").filter(Boolean);
        if (ids.length === 0) {
          res.status(200).json({ enquiries: [] });
          return;
        }
        const rows = await sql`select * from enquiries where id = any(${ids})`;
        res.status(200).json({ enquiries: rows });
        return;
      }

      const rows = await sql`select * from enquiries order by created_at desc`;
      res.status(200).json({ enquiries: rows });
      return;
    }

    if (req.method === "POST") {
      const { items, notes, clientId, contact } = req.body as {
        items?: EnquiryItemInput[];
        notes?: string;
        clientId?: string;
        contact?: { fullName?: string; email?: string; phone?: string };
      };

      if (!items || items.length === 0) {
        res.status(400).json({ error: "At least one item is required" });
        return;
      }
      const validItems = items.every(
        (i) => i.catalogItemId && i.companyId && Number.isInteger(i.quantity) && i.quantity > 0
      );
      if (!validItems) {
        res.status(400).json({ error: "Invalid items" });
        return;
      }

      let resolvedClientId: string;

      if (clientId) {
        // Internal flow: an admin files an enquiry against an existing client.
        const session = requireRole(req, res, ["admin"]);
        if (!session) return;
        const found = await sql`select id from clients where id = ${clientId}`;
        if (found.length === 0) {
          res.status(400).json({ error: "Client not found" });
          return;
        }
        resolvedClientId = clientId;
      } else {
        // Public flow: an open marketplace user submits with their contact
        // details — no account, no session. Matched to an existing client by
        // email so repeat enquirers don't pile up duplicates.
        if (!contact?.fullName || !contact.email || !contact.phone) {
          res.status(400).json({ error: "Name, email and phone are required" });
          return;
        }
        const existing = await sql`
          select id from clients where lower(email) = lower(${contact.email}) limit 1
        `;
        if (existing.length > 0) {
          resolvedClientId = existing[0].id;
          await sql`
            update clients set full_name = ${contact.fullName}, phone = ${contact.phone}
            where id = ${resolvedClientId}
          `;
        } else {
          resolvedClientId = randomUUID();
          await sql`
            insert into clients (id, full_name, email, phone)
            values (${resolvedClientId}, ${contact.fullName}, ${contact.email}, ${contact.phone})
          `;
        }
      }

      const enquiryId = randomUUID();
      const queries = [
        sql`insert into enquiries (id, client_id, notes) values (${enquiryId}, ${resolvedClientId}, ${notes || null})`,
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
