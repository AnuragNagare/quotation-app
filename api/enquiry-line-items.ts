import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sql } from "./_lib/db";
import { requireSession } from "./_lib/auth";

// Returns enquiry line items joined with catalog item + company names, scoped
// by role: a client only ever sees rows from their own enquiries, a business
// user only ever sees rows for companies they own, admin sees everything.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = requireSession(req, res);
  if (!session) return;

  const enquiryIdsParam = req.query.enquiryIds as string | undefined;
  if (!enquiryIdsParam) {
    res.status(200).json({ items: [] });
    return;
  }
  const enquiryIds = enquiryIdsParam.split(",").filter(Boolean);
  if (enquiryIds.length === 0) {
    res.status(200).json({ items: [] });
    return;
  }

  try {
    const rows = await sql`
      select
        eli.*,
        ci.name as "catalogItemName",
        ci.unit as "catalogItemUnit",
        ci.price as "catalogItemPrice",
        co.name as "companyName",
        co.owner_id as "companyOwnerId",
        e.client_id as "enquiryClientId"
      from enquiry_line_items eli
      join catalog_items ci on ci.id = eli.catalog_item_id
      join companies co on co.id = eli.company_id
      join enquiries e on e.id = eli.enquiry_id
      where eli.enquiry_id = any(${enquiryIds})
    `;

    const scoped = rows.filter((row: Record<string, unknown>) => {
      if (session.role === "admin") return true;
      if (session.role === "client") return row.enquiryClientId === session.sub;
      if (session.role === "business_user") return row.companyOwnerId === session.sub;
      return false;
    });

    res.status(200).json({ items: scoped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
