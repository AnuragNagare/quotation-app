import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db";
import { requireRole, requireSession } from "./_lib/auth";

async function canView(userId: string, role: string, quoteId: string): Promise<boolean> {
  if (role === "admin") return true;
  if (role === "business_user") {
    const rows = await sql`
      select 1 from quotes q join companies co on co.id = q.company_id
      where q.id = ${quoteId} and co.owner_id = ${userId}
    `;
    return rows.length > 0;
  }
  if (role === "client") {
    const rows = await sql`
      select 1 from quotes q join enquiries e on e.id = q.enquiry_id
      where q.id = ${quoteId} and e.client_id = ${userId}
    `;
    return rows.length > 0;
  }
  return false;
}

async function ownsQuoteCompany(userId: string, quoteId: string): Promise<boolean> {
  const rows = await sql`
    select 1 from quotes q join companies co on co.id = q.company_id
    where q.id = ${quoteId} and co.owner_id = ${userId}
  `;
  return rows.length > 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const session = requireSession(req, res);
      if (!session) return;
      const quoteId = req.query.quoteId as string | undefined;
      if (!quoteId) {
        res.status(400).json({ error: "Missing quoteId" });
        return;
      }
      if (!(await canView(session.sub, session.role, quoteId))) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const rows = await sql`
        select * from quote_revisions where quote_id = ${quoteId} order by created_at
      `;
      res.status(200).json({ revisions: rows });
      return;
    }

    if (req.method === "POST") {
      const session = requireRole(req, res, ["business_user"]);
      if (!session) return;
      const { quoteId, version, label } = req.body as {
        quoteId?: string;
        version?: string;
        label?: string;
      };
      if (!quoteId || !version) {
        res.status(400).json({ error: "Missing fields" });
        return;
      }
      if (!(await ownsQuoteCompany(session.sub, quoteId))) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const id = randomUUID();
      await sql.transaction([
        sql`update quote_revisions set is_current = false where quote_id = ${quoteId}`,
        sql`
          insert into quote_revisions (id, quote_id, version, label, is_current)
          values (${id}, ${quoteId}, ${version}, ${label || null}, true)
        `,
      ]);
      const rows = await sql`select * from quote_revisions where id = ${id}`;
      res.status(201).json({ revision: rows[0] });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
