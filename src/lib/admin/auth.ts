import { createHmac, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { adminConfig } from "./config";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

export const SESSION_COOKIE = "admin_session";
const SESSION_HOURS = 12;

/* Password hashes look like scrypt:N:r:p:saltB64:hashB64 (see
 * scripts/admin-setup.mjs). Colons, not dollar signs: .env loaders expand $. */
export async function verifyPassword(password: string): Promise<boolean> {
  const { passwordHash } = adminConfig();
  const parts = passwordHash.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  const derived = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 256 * 1024 * 1024,
  });
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function secret(): string {
  const cfg = adminConfig();
  if (cfg.sessionSecret) return cfg.sessionSecret;
  // The hash carries a random salt, so it is itself unguessable. Deriving the
  // key from it means a password change invalidates every open session.
  return createHmac("sha256", cfg.passwordHash).update("admin-session-v1").digest("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(): { token: string; maxAge: number } {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = SESSION_HOURS * 3600;
  const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + maxAge })).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, maxAge };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !adminConfig().hasPassword) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/* Changes must come from this site's own pages. SameSite=Strict already
 * blocks cross-site cookies; the Origin check is a second lock. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET";
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Returns an error Response when the caller is not a signed-in admin. */
export async function guard(request: Request): Promise<Response | null> {
  if (!sameOrigin(request)) return Response.json({ error: "Bad origin" }, { status: 403 });
  if (!(await isAuthed())) return Response.json({ error: "Not signed in" }, { status: 401 });
  return null;
}

/* Best-effort brute-force brake. Serverless instances do not share memory, so
 * this slows a single attacker rather than guaranteeing a global limit; the
 * scrypt cost and a long password do the real work. */
const failures = new Map<string, { count: number; until: number }>();

export function clientKey(request: Request): string {
  return (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
}

export function lockedFor(key: string): number {
  const entry = failures.get(key);
  if (!entry) return 0;
  const left = entry.until - Date.now();
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

export function recordFailure(key: string) {
  const entry = failures.get(key) ?? { count: 0, until: 0 };
  entry.count += 1;
  if (entry.count >= 5) entry.until = Date.now() + Math.min(15 * 60_000, 30_000 * 2 ** (entry.count - 5));
  failures.set(key, entry);
}

export function clearFailures(key: string) {
  failures.delete(key);
}
