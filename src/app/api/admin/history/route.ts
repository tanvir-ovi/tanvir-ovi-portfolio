import { guard } from "@/lib/admin/auth";
import { contentAt, history } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

/* GET            → recent published versions of the content file
 * GET ?ref=<sha> → the content as it was in that version */
export async function GET(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  const ref = new URL(request.url).searchParams.get("ref");
  try {
    if (ref) return Response.json({ content: await contentAt(ref) });
    return Response.json({ entries: await history() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}
