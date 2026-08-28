import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sql } from "./_lib/db.js";
import { requireRole } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const session = requireRole(req, res, ["business_user", "admin"]);
  if (!session) return;

  try {
    const idsParam = req.query.ids as string | undefined;
    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      if (ids.length === 0) {
        res.status(200).json({ clients: [] });
        return;
      }
      const rows = await sql`
        select id, email, role, full_name, phone, created_at from users
        where id = any(${ids})
      `;
      res.status(200).json({ clients: rows });
      return;
    }

    // Name search is a business-user-only workflow (adding an enquiry on
    // behalf of an existing client) — admins manage people via /admin-profiles.
    if (session.role !== "business_user") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const q = ((req.query.q as string) || "").trim();
    const rows = q
      ? await sql`
          select id, email, role, full_name, phone, created_at from users
          where role = 'client' and full_name ilike ${"%" + q + "%"}
          limit 10
        `
      : await sql`
          select id, email, role, full_name, phone, created_at from users
          where role = 'client'
          limit 10
        `;
    res.status(200).json({ clients: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
