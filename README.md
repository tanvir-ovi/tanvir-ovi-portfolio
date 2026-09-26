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
- `public/brain-surface.bin`: the solid MRI-derived hero brain (see Credits).
- `public/video/`: optimized Higgsfield neural-dive video and poster.

## The hero brain

The home hero renders a solid 3D brain with `three.js` and
`@react-three/fiber` (`src/components/home/NeuralBrain.tsx`). Both pial
hemispheres, the cerebellum and brainstem retain approximately 149,000 triangles.
Surface shading preserves the grooves during the opening rotation and pointer
tilt. Geometry is served in a compact binary file, with its format documented in
`public/brain-surface.LICENSE.txt`. The old point-cloud asset remains for history
but is no longer loaded.

The render loop pauses outside the viewport and in background tabs. Phones use
a lower pixel ratio and a dedicated stage below the copy so the brain stays
visible without overlapping the text. If the mesh or WebGL cannot load, an SVG signal field is
shown; visitors who prefer reduced motion receive that static alternative.

The "Inside the work" scene uses the existing Higgsfield Cinema Studio Pro
video, with separate desktop and mobile encodes. The scroll journey spans
two viewport heights on desktop (300svh total minus the 100svh stage), and
1.8 on mobile. Seeks are serialized and the current target
is approached with time-based easing. Reduced motion displays all four stages
as normal text, without loading the video.

## Credits

The 3D brain geometry (`public/brain-surface.bin` and `public/brain-points.json`) is derived from the
**"Brain for Blender"** mesh by **Anderson M. Winkler** (brainder.org), a real
human brain reconstructed from MRI.

- Source: https://brainder.org/research/brain-for-blender/
- License: Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0),
  https://creativecommons.org/licenses/by-sa/3.0/
- Both derived geometry files are made available under CC BY-SA 3.0.
  See their adjacent LICENSE.txt files for attribution and processing details.

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
