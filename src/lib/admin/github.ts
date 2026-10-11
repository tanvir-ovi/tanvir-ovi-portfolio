import { adminConfig } from "./config";

/* Thin GitHub REST client. Publishing builds one commit from the content file
 * plus any uploaded files (created earlier as blobs), so each publish is a
 * single entry in the history and triggers a single Vercel deployment. */

const API = "https://api.github.com";

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, repo } = adminConfig();
  const res = await fetch(`${API}/repos/${repo}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { message?: string }).message ?? "";
    } catch {}
    throw new GitHubError(`GitHub ${res.status}${detail ? `: ${detail}` : ""}`, res.status);
  }
  return (await res.json()) as T;
}

export async function headOf(branch: string): Promise<{ commit: string; tree: string } | null> {
  try {
    const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
    const commit = await gh<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
    return { commit: ref.object.sha, tree: commit.tree.sha };
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return null;
    throw err;
  }
}

export async function readText(path: string, ref: string): Promise<{ text: string; sha: string }> {
  const file = await gh<{ content: string; sha: string; encoding: string }>(
    `/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`
  );
  return { text: Buffer.from(file.content, "base64").toString("utf8"), sha: file.sha };
}

/** Blob sha of a path at a ref, or null when the file does not exist there. */
export async function blobShaAt(path: string, ref: string): Promise<string | null> {
  try {
    const file = await gh<{ sha: string }>(`/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`);
    return file.sha;
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return null;
    throw err;
  }
}

export async function createBlob(data: Buffer): Promise<string> {
  const blob = await gh<{ sha: string }>(`/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: data.toString("base64"), encoding: "base64" }),
  });
  return blob.sha;
}

export interface TreeFile {
  path: string;
  sha: string;
}

const AUTHOR = {
  name: "Tanvir Hossain Ovi",
  email: "64239179+tanvir-ovi@users.noreply.github.com",
};

/** Commits files on top of `base` and moves `branch` to the new commit. */
export async function commitFiles(opts: {
  branch: string;
  base: { commit: string; tree: string };
  files: TreeFile[];
  message: string;
  force?: boolean;
  createBranch?: boolean;
}): Promise<string> {
  const tree = await gh<{ sha: string }>(`/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: opts.base.tree,
      tree: opts.files.map((f) => ({ path: f.path, mode: "100644", type: "blob", sha: f.sha })),
    }),
  });
  const date = new Date().toISOString();
  const commit = await gh<{ sha: string }>(`/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: opts.message,
      tree: tree.sha,
      parents: [opts.base.commit],
      author: { ...AUTHOR, date },
      committer: { ...AUTHOR, date },
    }),
  });
  if (opts.createBranch) {
    await gh(`/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${opts.branch}`, sha: commit.sha }),
    });
  } else {
    await gh(`/git/refs/heads/${opts.branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: Boolean(opts.force) }),
    });
  }
  return commit.sha;
}

export interface HistoryEntry {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export async function contentHistory(path: string, branch: string): Promise<HistoryEntry[]> {
  const list = await gh<
    { sha: string; commit: { message: string; author: { name: string; date: string } } }[]
  >(`/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(branch)}&per_page=30`);
  return list.map((c) => ({
    sha: c.sha,
    message: c.commit.message.split("\n")[0],
    date: c.commit.author.date,
    author: c.commit.author.name,
  }));
}

export type DeployState = "pending" | "building" | "ready" | "error" | "unknown";

/* Vercel reports each build twice: as a commit status and as a GitHub
 * deployment whose status carries the deployed URL. */
export async function deployStatus(sha: string): Promise<{ state: DeployState; url: string | null }> {
  const deployments = await gh<{ id: number; environment: string }[]>(
    `/deployments?sha=${encodeURIComponent(sha)}&per_page=5`
  );
  if (deployments.length) {
    const statuses = await gh<{ state: string; environment_url?: string; target_url?: string }[]>(
      `/deployments/${deployments[0].id}/statuses?per_page=1`
    );
    const latest = statuses[0];
    if (latest) {
      const map: Record<string, DeployState> = {
        success: "ready",
        failure: "error",
        error: "error",
        inactive: "ready",
        in_progress: "building",
        queued: "pending",
        pending: "pending",
      };
      return { state: map[latest.state] ?? "unknown", url: latest.environment_url || null };
    }
  }
  const combined = await gh<{ state: string; statuses: { context: string; state: string }[] }>(
    `/commits/${encodeURIComponent(sha)}/status`
  );
  const vercel = combined.statuses.find((s) => s.context.toLowerCase().includes("vercel"));
  if (!vercel) return { state: "pending", url: null };
  const state: DeployState =
    vercel.state === "success" ? "ready" : vercel.state === "pending" ? "building" : "error";
  return { state, url: null };
}
