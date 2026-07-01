# Tanvir Hossain Ovi | Personal and Research Site

Personal academic portfolio for Tanvir Hossain Ovi, an EEG and brain-computer
interface researcher. Built with Next.js (App Router), TypeScript, Tailwind CSS v4,
and Framer Motion.

Live site: https://tanvir-ovi-portfolio.vercel.app

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

## Build

```bash
npm run build
npm run start
```
