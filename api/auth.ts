import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";

import { sql } from "./_lib/db.js";
import { clearSessionCookie, getSession, setSessionCookie, signSession } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string | undefined;

  try {
    if (req.method === "POST" && action === "signup") {
      const { email, password, fullName, role } = req.body as {
        email?: string;
        password?: string;
        fullName?: string;
        role?: string;
      };

      if (!email || !password || !fullName || (role !== "client" && role !== "business_user")) {
        res.status(400).json({ error: "Missing or invalid fields" });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters" });
        return;
      }

      const existing = await sql`select id from users where email = ${email}`;
      if (existing.length > 0) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const rows = await sql`
        insert into users (email, password_hash, role, full_name)
        values (${email}, ${passwordHash}, ${role}, ${fullName})
        returning id, email, role, full_name, phone, created_at
      `;
      const user = rows[0];
      const token = signSession({ sub: user.id, role: user.role });
      setSessionCookie(res, token);
      res.status(201).json({ user });
      return;
    }

    if (req.method === "POST" && action === "login") {
      const { email, password } = req.body as { email?: string; password?: string };
      if (!email || !password) {
        res.status(400).json({ error: "Missing email or password" });
        return;
      }

      const rows = await sql`select * from users where email = ${email}`;
      const user = rows[0];
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
      const matches = await bcrypt.compare(password, user.password_hash);
      if (!matches) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const token = signSession({ sub: user.id, role: user.role });
      setSessionCookie(res, token);
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
          created_at: user.created_at,
        },
      });
      return;
    }

    if (req.method === "POST" && action === "logout") {
      clearSessionCookie(res);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "GET" && action === "me") {
      const session = getSession(req);
      if (!session) {
        res.status(200).json({ user: null });
        return;
      }
      const rows = await sql`
        select id, email, role, full_name, phone, created_at from users where id = ${session.sub}
      `;
      res.status(200).json({ user: rows[0] ?? null });
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
