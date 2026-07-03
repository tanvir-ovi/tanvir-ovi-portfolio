# Tanvir Hossain Ovi | Personal and Research Site

Personal academic portfolio for Tanvir Hossain Ovi, an EEG and brain-computer
interface researcher. Built with Next.js (App Router), TypeScript, Tailwind CSS v4,
and Framer Motion.

Live site: https://tanvir-hossain-ovi.me

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Project structure

- `src/app/`: pages for Home, Research, Experience, About, and Contact.
- `src/components/`: UI components, grouped by page where relevant.
- `src/lib/data.ts`: all site content (publications, experience, skills, and more) in one place. Edit this file to update copy without touching components.
- `public/images/`: portrait and experiment setup photos.
- `public/docs/`: downloadable CV PDF.
- `public/brain-points.json`: the hero's 3D neural brain, baked from a real MRI-derived cortical surface (see Credits).

## The hero brain

The home hero renders an interactive 3D neural brain with `three.js` and
`@react-three/fiber` (`src/components/home/NeuralBrain.tsx`). The geometry is not
loaded from a runtime 3D model; it is pre-baked into `public/brain-points.json`
(a point cloud plus a low-poly surface shell) so nothing can fail to load at
runtime. If WebGL is unavailable, the hero falls back to the flat SVG signal
field. On mobile and with `prefers-reduced-motion`, the lighter SVG field is
used instead.

## Credits

The 3D brain geometry (`public/brain-points.json`) is derived from the
**"Brain for Blender"** mesh by **Anderson M. Winkler** (brainder.org), a real
human brain reconstructed from MRI.

- Source: https://brainder.org/research/brain-for-blender/
- License: Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0),
  https://creativecommons.org/licenses/by-sa/3.0/
- As a derivative work, `public/brain-points.json` is likewise made available
  under CC BY-SA 3.0. See `public/brain-points.LICENSE.txt`.

## Contact form

The contact form posts to Formspree (https://formspree.io). To enable email delivery:

1. Create a free form at formspree.io and copy its form ID.
2. Copy `.env.local.example` to `.env.local`.
3. Set `NEXT_PUBLIC_FORMSPREE_ID` to your form ID.
4. Restart the dev server.

Until this is configured, submitting the form opens the visitor's email client with a
pre-filled message instead, so the form is never broken.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Go to https://vercel.com/new and import the repository.
3. Vercel detects Next.js automatically. Click Deploy.
4. Add `NEXT_PUBLIC_FORMSPREE_ID` under Project Settings, Environment Variables, so the
   contact form can send email.

Every push to the `main` branch redeploys the site automatically.

## Domain

The production domain is **https://tanvir-hossain-ovi.me** (primary). `www.tanvir-hossain-ovi.me`
should be configured in Vercel to redirect to the primary domain. The canonical URL,
Open Graph URL, sitemap (`/sitemap.xml`), robots (`/robots.txt`), and structured data all
use the primary domain via `SITE_URL` in `src/app/layout.tsx`, `src/app/sitemap.ts`, and
`src/app/robots.ts`. To change domains later, update those three files.

## Build

```bash
npm run build
npm run start
```
