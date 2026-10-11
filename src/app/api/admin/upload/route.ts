import { guard } from "@/lib/admin/auth";
import { MAX_UPLOAD_BYTES, stageUpload } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Upload failed. Is the file under 4 MB?" }, { status: 400 });
  }
  const file = form.get("file");
  const kind = form.get("kind") === "cv" ? "cv" : "image";
  const cvPath = String(form.get("cvPath") ?? "");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "File is larger than 4 MB." }, { status: 413 });

  try {
    const result = await stageUpload({
      data: Buffer.from(await file.arrayBuffer()),
      filename: file.name,
      kind,
      cvPath,
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}
