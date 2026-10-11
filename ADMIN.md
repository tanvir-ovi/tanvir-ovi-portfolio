# Site editor (/admin)

Every word, link, number and photo on the site lives in `src/content/site.json`.
The editor at **https://tanvir-hossain-ovi.me/admin** edits that file. Publishing
commits it to `main` on GitHub, and Vercel rebuilds the live site in about a minute.

## One-time setup on Vercel

The editor needs two environment variables. Add both under
**Vercel → tanvir-ovi-portfolio → Settings → Environment Variables**, environment
**Production**, then redeploy (Deployments → latest → ⋯ → Redeploy).

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD_HASH` | The `scrypt:...` line printed by `npm run admin:setup`. |
| `GITHUB_TOKEN` | A fine-grained GitHub token, created as below. |

**Creating the GitHub token** (github.com → Settings → Developer settings →
Personal access tokens → Fine-grained tokens → Generate new token):

- Repository access: **Only select repositories** → `tanvir-ovi-portfolio`
- Repository permissions: **Contents: Read and write**, **Deployments: Read-only**,
  **Commit statuses: Read-only** (Metadata: Read-only is added automatically)
- Expiration: up to one year. When it expires the editor says it cannot load the
  content; make a new token and replace the value on Vercel.

Optional variables: `GITHUB_REPO` (default `tanvir-ovi/tanvir-ovi-portfolio`),
`GITHUB_BRANCH` (default `main`), `ADMIN_SESSION_SECRET`.

## Using it

1. Open `/admin` and sign in.
2. Pick a section on the left. Changes are kept as a draft on that device, even
   if the tab closes, until you publish.
3. Press **Publish** (or Ctrl + S). The review lists every change with its old and
   new value, and blocks publishing while a required field is empty or a link is
   malformed.
4. **Publish to live site** rebuilds the site. **Private preview** builds the
   same change on a separate Vercel address that only you can open while signed in
   to Vercel, and leaves the live site alone.

Other tools:

- **Files**: replace the CV PDF. The address stays `/docs/Tanvir_Hossain_Ovi_CV.pdf`
  so links already sent out keep working. Photos uploaded anywhere are resized to
  2400 px and converted to WebP in the browser before upload.
- **History**: every publish is a version. Open one, then publish it to roll back.
- **Backup & raw data**: download the whole site as one JSON file, or restore one.
- **Section order**: show, hide and reorder home page sections.
- Words wrapped in `*asterisks*` in the hero headline and award title get the
  gradient italic.

If two devices publish at the same time, the second one is told the site
changed and can save its draft as a file before loading the latest version.

## Changing the password

```bash
npm run admin:setup                    # generates a new password
npm run admin:setup -- "your password" # or choose one (12+ characters)
```

It writes the hash to `.env.local` (for local use) and prints the line to paste
into Vercel. Replace `ADMIN_PASSWORD_HASH` there and redeploy. Changing the
password signs out every open session.

## Local mode

`npm run dev` without `GITHUB_TOKEN` runs the editor in local mode: publishing
writes straight to `src/content/site.json` and uploads go into `public/uploads/`
on this computer. Commit and push as usual.

## How it is protected

- The password is checked on the server against a salted scrypt hash. Neither
  the password nor the token is ever sent to the browser.
- Sessions are signed, HTTP-only, same-site cookies that expire after 12 hours.
- Every write checks that the request comes from this site, and repeated wrong
  passwords are slowed down.
- Uploads must really be JPG, PNG, WebP, AVIF, GIF or PDF (checked by content,
  not file name), under 4 MB, and can only land in `public/uploads/` or the CV path.
- `/admin` and `/api/` are excluded from search engines.
