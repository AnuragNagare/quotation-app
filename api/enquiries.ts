import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db.js";
import { requireRole, requireSession } from "./_lib/auth.js";

interface EnquiryItemInput {
  catalogItemId: string;
  companyId: string;
  quantity: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const scope = req.query.scope as string | undefined;

      if (scope === "mine") {
        const session = requireRole(req, res, ["client"]);
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
        } else if (session.role === "client") {
          rows = await sql`select * from enquiries where id = any(${ids}) and client_id = ${session.sub}`;
        } else {
          rows = await sql`
            select distinct e.* from enquiries e
            join enquiry_line_items eli on eli.enquiry_id = e.id
            join companies c on c.id = eli.company_id
            where e.id = any(${ids}) and c.owner_id = ${session.sub}
          `;
        }
        res.status(200).json({ enquiries: rows });
        return;
      }

      res.status(400).json({ error: "Missing or invalid scope" });
      return;
    }

    if (req.method === "POST") {
      const session = requireSession(req, res);
      if (!session) return;

      const { items, notes, onBehalfOfClientId } = req.body as {
        items?: EnquiryItemInput[];
        notes?: string;
        onBehalfOfClientId?: string;
      };

      if (!items || items.length === 0) {
        res.status(400).json({ error: "At least one item is required" });
        return;
      }

      let clientId: string;
      if (session.role === "client") {
        clientId = session.sub;
      } else if (session.role === "business_user") {
        if (!onBehalfOfClientId) {
          res.status(400).json({ error: "onBehalfOfClientId is required for business users" });
          return;
        }
        clientId = onBehalfOfClientId;
      } else {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const enquiryId = randomUUID();
      const queries = [
        sql`insert into enquiries (id, client_id, notes) values (${enquiryId}, ${clientId}, ${notes || null})`,
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
