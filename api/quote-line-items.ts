import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db.js";
import { requireRole } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = requireRole(req, res, ["admin"]);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const quoteId = req.query.quoteId as string | undefined;
      if (!quoteId) {
        res.status(400).json({ error: "Missing quoteId" });
        return;
      }
      const rows = await sql`
        select * from quote_line_items where quote_id = ${quoteId} order by created_at
      `;
      res.status(200).json({ items: rows });
      return;
    }

    if (req.method === "POST") {
      const { quoteId, name, quantity, unitPrice, discountPercent } = req.body as {
        quoteId?: string;
        name?: string;
        quantity?: number;
        unitPrice?: number;
        discountPercent?: number;
      };
      if (!quoteId || !name) {
        res.status(400).json({ error: "Missing fields" });
        return;
      }
      const id = randomUUID();
      const rows = await sql`
        insert into quote_line_items (id, quote_id, name, quantity, unit_price, discount_percent)
        values (${id}, ${quoteId}, ${name}, ${quantity ?? 1}, ${unitPrice ?? 0}, ${discountPercent ?? 0})
        returning *
      `;
      res.status(201).json({ item: rows[0] });
      return;
    }

    if (req.method === "PATCH") {
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      const existingRows = await sql`select * from quote_line_items where id = ${id}`;
      const existing = existingRows[0];
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const patch = req.body as {
        name?: string;
        quantity?: number;
        unit_price?: number;
        discount_percent?: number;
      };
      const merged = {
        name: patch.name ?? existing.name,
        quantity: patch.quantity ?? existing.quantity,
        unit_price: patch.unit_price ?? existing.unit_price,
        discount_percent: patch.discount_percent ?? existing.discount_percent,
      };
      const rows = await sql`
        update quote_line_items set
          name = ${merged.name},
          quantity = ${merged.quantity},
          unit_price = ${merged.unit_price},
          discount_percent = ${merged.discount_percent}
        where id = ${id}
        returning *
      `;
      res.status(200).json({ item: rows[0] });
      return;
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      await sql`delete from quote_line_items where id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
