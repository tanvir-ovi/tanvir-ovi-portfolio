import { guard } from "@/lib/admin/auth";
import { deployStatus } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  const sha = new URL(request.url).searchParams.get("sha") ?? "";
  if (!/^[0-9a-f]{40}$/.test(sha)) return Response.json({ error: "Bad commit id." }, { status: 400 });
  try {
    return Response.json(await deployStatus(sha), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}
