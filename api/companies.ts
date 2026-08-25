import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db.js";
import { requireRole } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      // Public listing — used by both the marketplace and the internal shell.
      const rows = await sql`select * from companies order by name`;
      res.status(200).json({ companies: rows });
      return;
    }

    if (req.method === "POST") {
      const session = requireRole(req, res, ["admin"]);
      if (!session) return;
      const { name, description } = req.body as { name?: string; description?: string };
      if (!name) {
        res.status(400).json({ error: "Name is required" });
        return;
      }
      const id = randomUUID();
      const rows = await sql`
        insert into companies (id, owner_id, name, description)
        values (${id}, ${session.sub}, ${name}, ${description || null})
        returning *
      `;
      res.status(201).json({ company: rows[0] });
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
      const existingRows = await sql`select * from companies where id = ${id}`;
      const existing = existingRows[0];
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const patch = req.body as { name?: string; description?: string | null };
      const merged = {
        name: patch.name ?? existing.name,
        description: "description" in patch ? patch.description : existing.description,
      };
      if (!merged.name) {
        res.status(400).json({ error: "Name is required" });
        return;
      }
      const rows = await sql`
        update companies set name = ${merged.name}, description = ${merged.description}
        where id = ${id}
        returning *
      `;
      res.status(200).json({ company: rows[0] });
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
      await sql`delete from companies where id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
