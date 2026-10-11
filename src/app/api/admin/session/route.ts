import { isAuthed } from "@/lib/admin/auth";
import { adminConfig } from "@/lib/admin/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = adminConfig();
  const authed = await isAuthed();
  return Response.json(
    {
      authed,
      hasPassword: cfg.hasPassword,
      mode: cfg.mode,
      // Repository details are only for a signed-in editor.
      repo: authed ? cfg.repo : null,
      branch: authed ? cfg.branch : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
