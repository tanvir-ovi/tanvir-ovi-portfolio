import { cookies } from "next/headers";
import {
  clearFailures,
  clientKey,
  createSessionToken,
  lockedFor,
  recordFailure,
  sameOrigin,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/admin/auth";
import { adminConfig } from "@/lib/admin/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Bad origin" }, { status: 403 });
  if (!adminConfig().hasPassword) {
    return Response.json({ error: "The admin password is not set up yet." }, { status: 503 });
  }

  const key = clientKey(request);
  const wait = lockedFor(key);
  if (wait > 0) {
    return Response.json({ error: `Too many attempts. Try again in ${wait} seconds.` }, { status: 429 });
  }

  let password = "";
  try {
    password = String(((await request.json()) as { password?: unknown }).password ?? "");
  } catch {}

  if (!password || password.length > 512 || !(await verifyPassword(password))) {
    recordFailure(key);
    // A flat delay keeps failed and successful checks indistinguishable in time.
    await new Promise((r) => setTimeout(r, 600));
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  clearFailures(key);
  const { token, maxAge } = createSessionToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return Response.json({ ok: true });
}
