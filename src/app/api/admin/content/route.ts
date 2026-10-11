import { guard } from "@/lib/admin/auth";
import { ConflictError, loadContent, saveContent, serialize, type StagedUpload } from "@/lib/admin/store";
import { validateContent } from "@/lib/admin-schema";

export const dynamic = "force-dynamic";

const MAX_CONTENT_BYTES = 900 * 1024;

export async function GET(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  try {
    return Response.json(await loadContent(), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  let body: {
    content?: unknown;
    baseVersion?: string;
    uploads?: StagedUpload[];
    message?: string;
    target?: "live" | "preview";
    force?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const problems = validateContent(body.content);
  if (problems.length) {
    return Response.json({ error: "Fix the highlighted fields first.", problems }, { status: 422 });
  }
  if (Buffer.byteLength(serialize(body.content)) > MAX_CONTENT_BYTES) {
    return Response.json({ error: "Content is too large." }, { status: 413 });
  }

  // Only files this editor uploaded into the two public folders may ride along.
  const uploads = (Array.isArray(body.uploads) ? body.uploads : []).filter(
    (u) =>
      u &&
      typeof u.repoPath === "string" &&
      /^public\/(uploads\/\d{4}-\d{2}\/[a-z0-9-]+\.(jpg|png|webp|avif|gif)|docs\/[A-Za-z0-9._-]+\.pdf)$/.test(u.repoPath) &&
      typeof u.blobSha === "string" &&
      /^([0-9a-f]{40})?$/.test(u.blobSha)
  );

  const message = (body.message ?? "").toString().replace(/\s+/g, " ").trim().slice(0, 120) || "Update site content";

  try {
    const result = await saveContent({
      content: body.content,
      baseVersion: String(body.baseVersion ?? ""),
      uploads,
      message,
      target: body.target === "preview" ? "preview" : "live",
      force: Boolean(body.force),
    });
    return Response.json(result);
  } catch (err) {
    if (err instanceof ConflictError) {
      return Response.json({ error: err.message, conflict: true }, { status: 409 });
    }
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}
