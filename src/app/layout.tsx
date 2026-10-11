import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/data";

// Body / UI — a precise technical grotesque, on-brand for a scientist.
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Instrument labels, eyebrows, data — the "lab readout" voice.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  // Eyebrows and labels only; the body and headline fonts claim the preloads.
  preload: false,
});

// Display — a high-craft editorial serif with a real italic for emphasis.
// Every display line is set at regular weight, so only 400 ships.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const { seo, profile } = site;

export const metadata: Metadata = {
  title: {
    default: seo.title,
    template: seo.titleTemplate,
  },
  description: seo.description,
  metadataBase: new URL(seo.siteUrl),
  applicationName: profile.name,
  authors: [{ name: profile.name, url: seo.siteUrl }],
  creator: profile.name,
  publisher: profile.name,
  category: "science",
  keywords: seo.keywords,
  alternates: {
    canonical: "/",
  },
  verification: seo.googleVerification ? { google: seo.googleVerification } : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: seo.title,
    description: seo.shareDescription,
    type: "website",
    url: seo.siteUrl,
    siteName: profile.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.twitterDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
