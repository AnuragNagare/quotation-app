import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";

import { sql } from "./_lib/db";
import { requireRole } from "./_lib/auth";

async function ownsCompany(userId: string, companyId: string): Promise<boolean> {
  const rows = await sql`select 1 from companies where id = ${companyId} and owner_id = ${userId}`;
  return rows.length > 0;
}

async function ownsCategoryCompany(userId: string, categoryId: string): Promise<boolean> {
  const rows = await sql`
    select 1 from categories c join companies co on co.id = c.company_id
    where c.id = ${categoryId} and co.owner_id = ${userId}
  `;
  return rows.length > 0;
}

async function ownsItemCompany(userId: string, itemId: string): Promise<boolean> {
  const rows = await sql`
    select 1 from catalog_items ci join companies co on co.id = ci.company_id
    where ci.id = ${itemId} and co.owner_id = ${userId}
  `;
  return rows.length > 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const companyId = req.query.companyId as string | undefined;
      if (!companyId) {
        res.status(400).json({ error: "Missing companyId" });
        return;
      }
      const [categories, items] = await Promise.all([
        sql`select * from categories where company_id = ${companyId} order by created_at`,
        sql`select * from catalog_items where company_id = ${companyId} order by created_at desc`,
      ]);
      res.status(200).json({ categories, items });
      return;
    }

    if (req.method === "POST") {
      const session = requireRole(req, res, ["business_user"]);
      if (!session) return;
      const kind = req.query.type as string | undefined;

      if (kind === "category") {
        const { companyId, type, name } = req.body as {
          companyId?: string;
          type?: string;
          name?: string;
        };
        if (!companyId || !type || !name) {
          res.status(400).json({ error: "Missing fields" });
          return;
        }
        if (!(await ownsCompany(session.sub, companyId))) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        const id = randomUUID();
        const rows = await sql`
          insert into categories (id, company_id, type, name)
          values (${id}, ${companyId}, ${type}, ${name})
          returning *
        `;
        res.status(201).json({ category: rows[0] });
        return;
      }

      if (kind === "item") {
        const { companyId, categoryId, type, name, description, price, unit } = req.body as {
          companyId?: string;
          categoryId?: string;
          type?: string;
          name?: string;
          description?: string;
          price?: number;
          unit?: string;
        };
        if (!companyId || !categoryId || !type || !name) {
          res.status(400).json({ error: "Missing fields" });
          return;
        }
        if (!(await ownsCompany(session.sub, companyId))) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        const id = randomUUID();
        const rows = await sql`
          insert into catalog_items (id, company_id, category_id, type, name, description, price, unit)
          values (${id}, ${companyId}, ${categoryId}, ${type}, ${name}, ${description || null}, ${price ?? 0}, ${unit || null})
          returning *
        `;
        res.status(201).json({ item: rows[0] });
        return;
      }

      res.status(400).json({ error: "Unknown type" });
      return;
    }

    if (req.method === "PATCH") {
      const session = requireRole(req, res, ["business_user"]);
      if (!session) return;
      const id = req.query.id as string | undefined;
      if (!id) {
        res.status(400).json({ error: "Missing id" });
        return;
      }
      if (!(await ownsItemCompany(session.sub, id))) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const existingRows = await sql`select * from catalog_items where id = ${id}`;
      const existing = existingRows[0];
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const patch = req.body as {
        name?: string;
        description?: string | null;
        price?: number;
        unit?: string | null;
        is_active?: boolean;
        category_id?: string;
      };
      const merged = {
        name: patch.name ?? existing.name,
        description: "description" in patch ? patch.description : existing.description,
        price: patch.price ?? existing.price,
        unit: "unit" in patch ? patch.unit : existing.unit,
        is_active: patch.is_active ?? existing.is_active,
        category_id: patch.category_id ?? existing.category_id,
      };
      const rows = await sql`
        update catalog_items set
          name = ${merged.name},
          description = ${merged.description},
          price = ${merged.price},
          unit = ${merged.unit},
          is_active = ${merged.is_active},
          category_id = ${merged.category_id}
        where id = ${id}
        returning *
      `;
      res.status(200).json({ item: rows[0] });
      return;
    }

    if (req.method === "DELETE") {
      const session = requireRole(req, res, ["business_user"]);
      if (!session) return;
      const id = req.query.id as string | undefined;
      const kind = req.query.type as string | undefined;
      if (!id || !kind) {
        res.status(400).json({ error: "Missing id or type" });
        return;
      }

      if (kind === "category") {
        if (!(await ownsCategoryCompany(session.sub, id))) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        await sql`delete from categories where id = ${id}`;
        res.status(200).json({ ok: true });
        return;
      }

      if (kind === "item") {
        if (!(await ownsItemCompany(session.sub, id))) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        await sql`delete from catalog_items where id = ${id}`;
        res.status(200).json({ ok: true });
        return;
      }

      res.status(400).json({ error: "Unknown type" });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
