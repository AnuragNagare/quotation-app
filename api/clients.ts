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
        select id, email, role, full_name, phone, avatar_url, created_at from users
        where id = any(${ids})
      `;
      res.status(200).json({ clients: rows });
      return;
    }

    // Clients who have enquired with one of the caller's companies, with how
    // many enquiries / quotes they have for that company.
    if (req.query.scope === "biz") {
      if (session.role !== "business_user") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const companyId = req.query.companyId as string | undefined;
      if (!companyId) {
        res.status(400).json({ error: "Missing companyId" });
        return;
      }
      const owns = await sql`select 1 from companies where id = ${companyId} and owner_id = ${session.sub}`;
      if (owns.length === 0) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const rows = await sql`
        select
          u.id, u.email, u.role, u.full_name, u.phone, u.avatar_url, u.created_at,
          count(distinct e.id)::int as enquiry_count,
          count(distinct q.id)::int as quote_count,
          max(e.created_at) as last_enquiry_at
        from users u
        join enquiries e on e.client_id = u.id
        left join quotes q on q.enquiry_id = e.id and q.company_id = ${companyId}
        where u.role = 'client'
          and exists (
            select 1 from enquiry_line_items eli
            where eli.enquiry_id = e.id and eli.company_id = ${companyId}
          )
        group by u.id
        order by max(e.created_at) desc
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
          select id, email, role, full_name, phone, avatar_url, created_at from users
          where role = 'client' and full_name ilike ${"%" + q + "%"}
          limit 10
        `
      : await sql`
          select id, email, role, full_name, phone, avatar_url, created_at from users
          where role = 'client'
          limit 10
        `;
    res.status(200).json({ clients: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
