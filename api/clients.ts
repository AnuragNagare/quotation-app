import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db.js";
import { requireRole } from "./_lib/auth.js";

// Clients are lightweight contact records (name/email/phone) — not login
// accounts. They are created either from the internal Clients tab or
// automatically when an open user submits an enquiry from the marketplace.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = requireRole(req, res, ["admin"]);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const idsParam = req.query.ids as string | undefined;
      if (idsParam) {
        const ids = idsParam.split(",").filter(Boolean);
        if (ids.length === 0) {
          res.status(200).json({ clients: [] });
          return;
        }
        const rows = await sql`select * from clients where id = any(${ids})`;
        res.status(200).json({ clients: rows });
        return;
      }

      const q = ((req.query.q as string) || "").trim();
      if (q || "q" in req.query) {
        const rows = q
          ? await sql`
              select * from clients
              where full_name ilike ${"%" + q + "%"} or email ilike ${"%" + q + "%"}
              order by created_at desc
              limit 10
            `
          : await sql`select * from clients order by created_at desc limit 10`;
        res.status(200).json({ clients: rows });
        return;
      }

      const rows = await sql`select * from clients order by created_at desc`;
      res.status(200).json({ clients: rows });
      return;
    }

    if (req.method === "POST") {
      const { fullName, email, phone } = req.body as {
        fullName?: string;
        email?: string;
        phone?: string;
      };
      if (!fullName) {
        res.status(400).json({ error: "Client name is required" });
        return;
      }
      const id = randomUUID();
      const rows = await sql`
        insert into clients (id, full_name, email, phone)
        values (${id}, ${fullName}, ${email || null}, ${phone || null})
        returning *
      `;
      res.status(201).json({ client: rows[0] });
      return;
    }

    if (req.method === "PATCH") {
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      const existingRows = await sql`select * from clients where id = ${id}`;
      const existing = existingRows[0];
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const patch = req.body as { full_name?: string; email?: string | null; phone?: string | null };
      const merged = {
        full_name: patch.full_name ?? existing.full_name,
        email: "email" in patch ? patch.email : existing.email,
        phone: "phone" in patch ? patch.phone : existing.phone,
      };
      const rows = await sql`
        update clients set full_name = ${merged.full_name}, email = ${merged.email}, phone = ${merged.phone}
        where id = ${id}
        returning *
      `;
      res.status(200).json({ client: rows[0] });
      return;
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      await sql`delete from clients where id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
