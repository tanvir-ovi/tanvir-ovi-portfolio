import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { adminConfig, CONTENT_PATH, PREVIEW_BRANCH } from "./config";
import {
  blobShaAt,
  commitFiles,
  contentHistory,
  createBlob,
  deployStatus,
  headOf,
  readText,
  type HistoryEntry,
  type TreeFile,
} from "./github";

/* One storage interface, two backends: GitHub commits on Vercel, plain files
 * on this computer during `next dev` without a token. `version` is the git
 * blob sha of site.json, so two editors cannot silently overwrite each other. */

const gitBlobSha = (data: Buffer) =>
  createHash("sha1").update(`blob ${data.length}\0`).update(data).digest("hex");

export function serialize(content: unknown): string {
  return JSON.stringify(content, null, 2) + "\n";
}

const repoFile = (rel: string) => path.join(process.cwd(), rel);

export async function loadContent(): Promise<{ content: unknown; version: string }> {
  const cfg = adminConfig();
  if (cfg.mode === "github") {
    const file = await readText(CONTENT_PATH, cfg.branch);
    return { content: JSON.parse(file.text), version: file.sha };
  }
  const data = await readFile(repoFile(CONTENT_PATH));
  return { content: JSON.parse(data.toString("utf8")), version: gitBlobSha(data) };
}

export interface StagedUpload {
  /** Repository path, e.g. public/uploads/2026-10/photo-ab12cd.webp */
  repoPath: string;
  /** Blob sha in GitHub mode; empty in local mode (already written). */
  blobSha: string;
}

export class ConflictError extends Error {}

export async function saveContent(opts: {
  content: unknown;
  baseVersion: string;
  uploads: StagedUpload[];
  message: string;
  target: "live" | "preview";
  force: boolean;
}): Promise<{ commit: string | null; version: string }> {
  const cfg = adminConfig();
  const text = serialize(opts.content);
  const data = Buffer.from(text, "utf8");

  if (cfg.mode !== "github") {
    if (opts.target === "preview") throw new Error("Preview needs the GitHub connection. In local mode every save is already visible at localhost.");
    const current = await readFile(repoFile(CONTENT_PATH));
    if (!opts.force && gitBlobSha(current) !== opts.baseVersion) throw new ConflictError("site.json changed on disk since you opened it.");
    await writeFile(repoFile(CONTENT_PATH), data);
    return { commit: null, version: gitBlobSha(data) };
  }

  const live = await headOf(cfg.branch);
  if (!live) throw new Error(`Branch ${cfg.branch} not found in ${cfg.repo}.`);
  const liveVersion = await blobShaAt(CONTENT_PATH, live.commit);
  if (!opts.force && liveVersion !== opts.baseVersion) {
    throw new ConflictError("The published content changed since you opened the editor.");
  }

  const files: TreeFile[] = [
    { path: CONTENT_PATH, sha: await createBlob(data) },
    ...opts.uploads.filter((u) => u.blobSha).map((u) => ({ path: u.repoPath, sha: u.blobSha })),
  ];

  if (opts.target === "preview") {
    // The preview branch is rebuilt from the live branch every time, so it
    // never drifts and never needs merging back.
    const existing = await headOf(PREVIEW_BRANCH);
    const commit = await commitFiles({
      branch: PREVIEW_BRANCH,
      base: live,
      files,
      message: `Preview: ${opts.message}`,
      force: true,
      createBranch: !existing,
    });
    return { commit, version: opts.baseVersion };
  }

  try {
    const commit = await commitFiles({ branch: cfg.branch, base: live, files, message: opts.message });
    return { commit, version: gitBlobSha(data) };
  } catch (err) {
    // A code push can land between reading the head and moving it. The
    // content file itself was checked above, so retry once on the new head.
    const retryBase = await headOf(cfg.branch);
    if (!retryBase || retryBase.commit === live.commit) throw err;
    const retryVersion = await blobShaAt(CONTENT_PATH, retryBase.commit);
    if (!opts.force && retryVersion !== opts.baseVersion) throw new ConflictError("The published content changed while publishing.");
    const commit = await commitFiles({ branch: cfg.branch, base: retryBase, files, message: opts.message });
    return { commit, version: gitBlobSha(data) };
  }
}

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function sniff(data: Buffer): string | null {
  const hex = data.subarray(0, 12).toString("hex");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e47")) return "image/png";
  if (hex.startsWith("47494638")) return "image/gif";
  if (data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (data.subarray(4, 12).toString().startsWith("ftypavi")) return "image/avif";
  if (data.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  return null;
}

/** Stores an uploaded file. Returns its public address and staging info. */
export async function stageUpload(opts: {
  data: Buffer;
  filename: string;
  kind: "image" | "cv";
  cvPath: string;
}): Promise<{ url: string; upload: StagedUpload }> {
  const cfg = adminConfig();
  if (opts.data.length > MAX_UPLOAD_BYTES) throw new Error("File is larger than 4 MB.");
  const type = sniff(opts.data);

  let publicPath: string;
  if (opts.kind === "cv") {
    if (type !== "application/pdf") throw new Error("The CV must be a PDF.");
    // Keep the CV address fixed so links already sent out keep working.
    if (!/^\/docs\/[A-Za-z0-9._-]+\.pdf$/.test(opts.cvPath)) throw new Error("CV address must look like /docs/Name.pdf");
    publicPath = opts.cvPath;
  } else {
    if (!type || !IMAGE_TYPES[type]) throw new Error("Use a JPG, PNG, WebP, AVIF or GIF image.");
    const stem =
      opts.filename
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "image";
    const month = new Date().toISOString().slice(0, 7);
    publicPath = `/uploads/${month}/${stem}-${randomBytes(3).toString("hex")}.${IMAGE_TYPES[type]}`;
  }
  const repoPath = `public${publicPath}`;

  if (cfg.mode === "github") {
    return { url: publicPath, upload: { repoPath, blobSha: await createBlob(opts.data) } };
  }
  await mkdir(path.dirname(repoFile(repoPath)), { recursive: true });
  await writeFile(repoFile(repoPath), opts.data);
  return { url: publicPath, upload: { repoPath, blobSha: "" } };
}

export async function history(): Promise<HistoryEntry[]> {
  const cfg = adminConfig();
  if (cfg.mode !== "github") return [];
  return contentHistory(CONTENT_PATH, cfg.branch);
}

export async function contentAt(ref: string): Promise<unknown> {
  const cfg = adminConfig();
  if (cfg.mode !== "github") throw new Error("History needs the GitHub connection.");
  if (!/^[0-9a-f]{7,40}$/.test(ref)) throw new Error("Bad version id.");
  return JSON.parse((await readText(CONTENT_PATH, ref)).text);
}

export { deployStatus };
