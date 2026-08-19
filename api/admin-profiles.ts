import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sql } from "./_lib/db.js";
import { requireRole } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = requireRole(req, res, ["admin"]);
  if (!session) return;

  try {
    if (req.method === "GET") {
      const role = req.query.role as string | undefined;
      if (role !== "client" && role !== "business_user") {
        res.status(400).json({ error: "Missing or invalid role" });
        return;
      }
      const rows = await sql`
        select id, email, role, full_name, phone, created_at from users
        where role = ${role} order by created_at desc
      `;
      res.status(200).json({ profiles: rows });
      return;
    }

    if (req.method === "PATCH") {
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      const existingRows = await sql`select * from users where id = ${id}`;
      const existing = existingRows[0];
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const patch = req.body as { full_name?: string; phone?: string };
      const merged = {
        full_name: patch.full_name ?? existing.full_name,
        phone: "phone" in patch ? patch.phone : existing.phone,
      };
      const rows = await sql`
        update users set full_name = ${merged.full_name}, phone = ${merged.phone}
        where id = ${id}
        returning id, email, role, full_name, phone, created_at
      `;
      res.status(200).json({ profile: rows[0] });
      return;
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      await sql`delete from users where id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
