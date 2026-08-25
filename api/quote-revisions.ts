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
        select * from quote_revisions where quote_id = ${quoteId} order by created_at
      `;
      res.status(200).json({ revisions: rows });
      return;
    }

    if (req.method === "POST") {
      const { quoteId, version, label } = req.body as {
        quoteId?: string;
        version?: string;
        label?: string;
      };
      if (!quoteId || !version) {
        res.status(400).json({ error: "Missing fields" });
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
