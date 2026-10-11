/* Admin configuration, read from environment variables.
 *
 *   ADMIN_PASSWORD_HASH  required. Create it with `npm run admin:setup`.
 *   GITHUB_TOKEN         required on Vercel. A fine-grained token with
 *                        Contents read/write on this repository only.
 *   GITHUB_REPO          optional, "owner/name". Defaults to this repository.
 *   GITHUB_BRANCH        optional, defaults to "main".
 *   ADMIN_SESSION_SECRET optional. Derived from the password hash when unset,
 *                        so changing the password signs everyone out.
 *
 * Without GITHUB_TOKEN, `next dev` runs in local mode: edits are written
 * straight to src/content/site.json and public/ on this computer. */

export type AdminMode = "github" | "local" | "unconfigured";

export const CONTENT_PATH = "src/content/site.json";
export const PREVIEW_BRANCH = "admin-preview";

export function adminConfig() {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim() ?? "";
  const token = process.env.GITHUB_TOKEN?.trim() ?? "";
  const vercelRepo =
    process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "";
  const repo = process.env.GITHUB_REPO?.trim() || vercelRepo || "tanvir-ovi/tanvir-ovi-portfolio";
  const branch = process.env.GITHUB_BRANCH?.trim() || "main";
  const isDev = process.env.NODE_ENV === "development";

  let mode: AdminMode = "unconfigured";
  if (token) mode = "github";
  else if (isDev) mode = "local";

  return {
    passwordHash,
    token,
    repo,
    branch,
    mode,
    hasPassword: passwordHash.length > 0,
    sessionSecret: process.env.ADMIN_SESSION_SECRET?.trim() || "",
  };
}
