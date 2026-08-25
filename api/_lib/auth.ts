import jwt from "jsonwebtoken";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const COOKIE_NAME = "etq_session";
const JWT_SECRET = process.env.JWT_SECRET!;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type Role = "admin";

export interface SessionPayload {
  sub: string;
  role: Role;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE_SECONDS });
}

function serializeCookie(name: string, value: string, maxAgeSeconds: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader("Set-Cookie", serializeCookie(COOKIE_NAME, token, MAX_AGE_SECONDS));
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader("Set-Cookie", serializeCookie(COOKIE_NAME, "", 0));
}

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
  }
  return result;
}

export function getSession(req: VercelRequest): SessionPayload | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const token = parseCookies(header)[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function requireSession(
  req: VercelRequest,
  res: VercelResponse
): SessionPayload | null {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return session;
}

export function requireRole(
  req: VercelRequest,
  res: VercelResponse,
  roles: Role[]
): SessionPayload | null {
  const session = requireSession(req, res);
  if (!session) return null;
  if (!roles.includes(session.role)) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return session;
}
