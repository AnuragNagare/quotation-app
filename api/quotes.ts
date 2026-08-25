import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db.js";
import { requireRole } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const session = requireRole(req, res, ["admin"]);
      if (!session) return;

      const enquiryId = req.query.enquiryId as string | undefined;
      const companyId = req.query.companyId as string | undefined;
      if (enquiryId && companyId) {
        const rows = await sql`
          select * from quotes where enquiry_id = ${enquiryId} and company_id = ${companyId}
        `;
        res.status(200).json({ quote: rows[0] ?? null });
        return;
      }

      const rows = await sql`select * from quotes order by created_at desc`;
      res.status(200).json({ quotes: rows });
      return;
    }

    if (req.method === "POST") {
      const session = requireRole(req, res, ["admin"]);
      if (!session) return;

      const { enquiryId, companyId, taxRatePercent } = req.body as {
        enquiryId?: string;
        companyId?: string;
        taxRatePercent?: number;
      };
      if (!enquiryId || !companyId) {
        res.status(400).json({ error: "Missing enquiryId or companyId" });
        return;
      }

      const existing = await sql`
        select * from quotes where enquiry_id = ${enquiryId} and company_id = ${companyId}
      `;
      if (existing.length > 0) {
        res.status(200).json({ id: existing[0].id });
        return;
      }

      const quoteId = randomUUID();
      const revisionId = randomUUID();

      await sql.transaction([
        sql`
          insert into quotes (id, enquiry_id, company_id, business_user_id, tax_rate_percent)
          values (${quoteId}, ${enquiryId}, ${companyId}, ${session.sub}, ${taxRatePercent ?? 18})
        `,
        sql`
          insert into quote_line_items (quote_id, enquiry_line_item_id, name, quantity, unit_price, discount_percent)
          select ${quoteId}, eli.id, ci.name, eli.quantity, ci.price, 0
          from enquiry_line_items eli join catalog_items ci on ci.id = eli.catalog_item_id
          where eli.enquiry_id = ${enquiryId} and eli.company_id = ${companyId}
        `,
        sql`
          insert into quote_revisions (id, quote_id, version, label, is_current)
          values (${revisionId}, ${quoteId}, 'v1.0', 'Original', true)
        `,
        sql`update enquiries set status = 'quoted' where id = ${enquiryId} and status = 'open'`,
      ]);

      res.status(201).json({ id: quoteId });
      return;
    }

    if (req.method === "PATCH") {
      const session = requireRole(req, res, ["admin"]);
      if (!session) return;
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }

      const existingRows = await sql`select * from quotes where id = ${id}`;
      const existing = existingRows[0];
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const patch = req.body as {
        status?: string;
        tax_rate_percent?: number;
        terms?: string | null;
        notes?: string | null;
      };
      const merged = {
        status: patch.status ?? existing.status,
        tax_rate_percent: patch.tax_rate_percent ?? existing.tax_rate_percent,
        terms: "terms" in patch ? patch.terms : existing.terms,
        notes: "notes" in patch ? patch.notes : existing.notes,
      };

      const rows = await sql`
        update quotes set
          status = ${merged.status},
          tax_rate_percent = ${merged.tax_rate_percent},
          terms = ${merged.terms},
          notes = ${merged.notes},
          updated_at = now()
        where id = ${id}
        returning *
      `;
      res.status(200).json({ quote: rows[0] });
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
      await sql`delete from quotes where id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
