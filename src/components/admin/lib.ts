import { getPath, joinPath, panels, type Field, type Panel } from "@/lib/admin-schema";

// ------------------------------------------------------------------- types

export type Mode = "github" | "local" | "unconfigured";

export interface Session {
  authed: boolean;
  hasPassword: boolean;
  mode: Mode;
  repo: string | null;
  branch: string | null;
}

export interface StagedUpload {
  repoPath: string;
  blobSha: string;
}

export interface HistoryEntry {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export type DeployState = "pending" | "building" | "ready" | "error" | "unknown";

// --------------------------------------------------------------------- api

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: Record<string, unknown> = {}
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    ...init,
    cache: "no-store",
    headers: init.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init.headers },
  });
  let body: Record<string, unknown> = {};
  try {
    body = await res.json();
  } catch {}
  if (!res.ok) throw new ApiError(String(body.error ?? `Request failed (${res.status})`), res.status, body);
  return body as T;
}

// ------------------------------------------------------------- comparison

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export interface Change {
  path: string;
  panel: Panel | undefined;
  label: string;
  before: unknown;
  after: unknown;
}

function leaves(value: unknown, path: string, out: Map<string, unknown>) {
  if (value && typeof value === "object") {
    const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value);
    if (!entries.length) out.set(path, Array.isArray(value) ? [] : {});
    for (const [k, v] of entries) leaves(v, path ? `${path}.${k}` : k, out);
  } else out.set(path, value);
}

/** Leaf-level differences, collapsed to the nearest list item or tag list. */
export function diffContent(before: unknown, after: unknown): Change[] {
  const a = new Map<string, unknown>();
  const b = new Map<string, unknown>();
  leaves(before, "", a);
  leaves(after, "", b);
  const paths = new Set([...a.keys(), ...b.keys()]);
  const grouped = new Map<string, Change>();
  for (const p of paths) {
    if (deepEqual(a.get(p), b.get(p))) continue;
    const anchor = existenceAnchor(p, before, after) ?? changeAnchor(p);
    if (grouped.has(anchor)) continue;
    grouped.set(anchor, {
      path: anchor,
      panel: panelFor(anchor),
      label: describePath(anchor, getPath(after, anchor) === undefined ? before : after),
      before: getPath(before, anchor),
      after: getPath(after, anchor),
    });
  }
  return [...grouped.values()];
}

/* An added or deleted list item is one change, not one per field. */
function existenceAnchor(path: string, before: unknown, after: unknown): string | null {
  const segs = path.split(".");
  for (let i = 1; i <= segs.length; i++) {
    const sub = segs.slice(0, i).join(".");
    if ((getPath(before, sub) === undefined) !== (getPath(after, sub) === undefined)) return sub;
  }
  return null;
}

/* Collapse a leaf path to something readable: a whole tag list, a whole
 * image, or a single text field. */
function changeAnchor(path: string): string {
  const field = fieldAt(path);
  if (field?.field && ["tags", "paragraphs", "image", "sections"].includes(field.field.type)) return field.path;
  return path;
}

const prefixes = panels.flatMap((panel) =>
  panel.fields.map((f) => ({ panel, prefix: joinPath(panel.root, f.key) }))
);

export function panelFor(path: string): Panel | undefined {
  let best: { panel: Panel; prefix: string } | undefined;
  for (const entry of prefixes) {
    if (path === entry.prefix || path.startsWith(entry.prefix + ".")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best?.panel;
}

/** The schema field that owns a path, plus that field's own path. */
export function fieldAt(path: string): { field: Field; path: string } | undefined {
  const panel = panelFor(path);
  if (!panel) return undefined;
  const segs = path.slice(panel.root ? panel.root.length + 1 : 0).split(".").filter(Boolean);
  let fields = panel.fields;
  let current = panel.root;
  let found: { field: Field; path: string } | undefined;
  let i = 0;
  while (i < segs.length) {
    // A field with an empty key edits the list item itself (e.g. a photo).
    const field = fields.find((f) => f.key === segs[i]) ?? fields.find((f) => f.key === "");
    if (!field) break;
    if (field.key) {
      current = joinPath(current, segs[i]);
      i++;
    }
    found = { field, path: current };
    if (!field.key && field.type !== "image") break;
    if (field.type === "object") {
      fields = field.fields;
      continue;
    }
    if (field.type === "list" && i < segs.length) {
      current = joinPath(current, segs[i]);
      i++;
      fields = field.fields;
      continue;
    }
    break;
  }
  return found;
}

/** "Publications › Frequency Band Dissociation… › Title" */
export function describePath(path: string, content?: unknown): string {
  const panel = panelFor(path);
  if (!panel) return path;
  const parts: string[] = [panel.title];
  const segs = path.slice(panel.root ? panel.root.length + 1 : 0).split(".").filter(Boolean);
  let fields: Field[] = panel.fields;
  let current = panel.root;
  let i = 0;
  while (i < segs.length) {
    const field = fields.find((f) => f.key === segs[i]);
    if (!field) break;
    current = joinPath(current, segs[i]);
    i++;
    // A panel that is just one list already carries the list's name.
    if (!(field.type === "list" && panel.fields.length === 1)) parts.push(field.label);
    if (field.type === "object") {
      fields = field.fields;
      continue;
    }
    if (field.type === "list" && i < segs.length) {
      const index = Number(segs[i]);
      current = joinPath(current, segs[i]);
      i++;
      const item = content ? (getPath(content, current) as Record<string, unknown> | undefined) : undefined;
      const title = item && field.titleKey ? String(item[field.titleKey] ?? "") : "";
      parts.push(title ? truncate(title, 42) : `${field.itemLabel} ${index + 1}`);
      fields = field.fields;
      continue;
    }
    break;
  }
  return parts.join(" › ");
}

export function truncate(text: string, n: number) {
  return text.length > n ? text.slice(0, n - 1).trimEnd() + "…" : text;
}

export function preview(value: unknown): string {
  if (value === undefined) return "(none)";
  if (value === null) return "(empty)";
  if (typeof value === "string") return value ? truncate(value, 140) : "(empty)";
  if (typeof value === "boolean") return value ? "On" : "Off";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "string")) return value.length ? truncate(value.join(", "), 140) : "(empty list)";
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj.src === "string") return obj.src || "(no picture)";
  const first = Object.values(obj).find((v) => typeof v === "string" && v);
  return first ? truncate(String(first), 140) : "(item)";
}

// ------------------------------------------------------------------ images

export interface PreparedImage {
  file: File;
  width: number;
  height: number;
}

/* Downscale anything over 2400 px and re-encode to WebP, which keeps uploads
 * well under the 4 MB request limit and the site fast. Transparency survives. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  if (file.type === "image/gif") {
    bitmap.close();
    return { file, width, height };
  }
  const MAX = 2400;
  const scale = Math.min(1, MAX / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const small = scale === 1 && file.size < 600_000 && (file.type === "image/webp" || file.type === "image/avif");
  if (small) {
    bitmap.close();
    return { file, width, height };
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { file, width, height };
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  if (!blob || (scale === 1 && blob.size >= file.size)) return { file, width, height };
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return { file: new File([blob], name, { type: "image/webp" }), width: w, height: h };
}

// ------------------------------------------------------------------- misc

export function timeAgo(iso: string | number): string {
  const t = typeof iso === "number" ? iso : Date.parse(iso);
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export const DRAFT_KEY = "site-admin-draft-v1";

export interface StoredDraft {
  content: unknown;
  baseVersion: string;
  uploads: StagedUpload[];
  savedAt: number;
}

export function readDraft(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch {
    return null;
  }
}

export function writeDraft(draft: StoredDraft | null) {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
