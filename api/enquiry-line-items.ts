import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sql } from "./_lib/db.js";
import { requireRole } from "./_lib/auth.js";

// Returns enquiry line items joined with catalog item + company names.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = requireRole(req, res, ["admin"]);
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
        co.name as "companyName"
      from enquiry_line_items eli
      join catalog_items ci on ci.id = eli.catalog_item_id
      join companies co on co.id = eli.company_id
      where eli.enquiry_id = any(${enquiryIds})
    `;

    res.status(200).json({ items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
