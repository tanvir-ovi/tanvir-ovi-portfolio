import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";

// Body / UI — a precise technical grotesque, on-brand for a scientist.
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Instrument labels, eyebrows, data — the "lab readout" voice.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Display — a high-craft editorial serif with a real italic for emphasis.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = "https://tanvir-hossain-ovi.me";

export const metadata: Metadata = {
  title: {
    default: "Tanvir Hossain Ovi | EEG & BCI Researcher",
    template: "%s · Tanvir Hossain Ovi",
  },
  description:
    "Tanvir Hossain Ovi is an EEG and brain-computer interface researcher working on cognitive load, emotion recognition, and imagined speech decoding. Portfolio, publications, and projects.",
  metadataBase: new URL(SITE_URL),
  applicationName: "Tanvir Hossain Ovi",
  authors: [{ name: "Tanvir Hossain Ovi", url: SITE_URL }],
  creator: "Tanvir Hossain Ovi",
  publisher: "Tanvir Hossain Ovi",
  category: "science",
  keywords: [
    "Tanvir Hossain Ovi",
    "Tanvir Ovi",
    "Tanvir Ovi EEG",
    "EEG researcher",
    "brain-computer interface",
    "BCI researcher",
    "deep learning EEG",
    "emotion recognition EEG",
    "imagined speech decoding",
    "cognitive load",
    "University of Chittagong",
    "neural engineering",
  ],
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "PiXcgKTo-T5ue6ty_6JrDYzDJcrq2OKt8yrAWms2EXA",
  },
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
    title: "Tanvir Hossain Ovi | EEG & BCI Researcher",
    description:
      "Deep learning systems that decode cognition, emotion, and identity from EEG. Publications, research, and projects.",
    type: "website",
    url: SITE_URL,
    siteName: "Tanvir Hossain Ovi",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanvir Hossain Ovi | EEG & BCI Researcher",
    description:
      "Deep learning systems that decode cognition, emotion, and identity from EEG.",
  },
};

// Structured data (JSON-LD): a linked graph of Person + WebSite + ProfilePage
// so search engines resolve "Tanvir Hossain Ovi" / "Tanvir Ovi" to this site.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Tanvir Hossain Ovi",
      alternateName: ["Tanvir Ovi", "Ovi"],
      url: SITE_URL,
      image: `${SITE_URL}/images/logo.png`,
      jobTitle: "EEG & Brain-Computer Interface Researcher",
      description:
        "EEG and brain-computer interface researcher working on cognitive load, emotion recognition, and imagined speech decoding.",
      email: "mailto:tanvirhossainovi.eee@std.cu.ac.bd",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Chattogram",
        addressCountry: "Bangladesh",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "University of Chittagong",
      },
      knowsAbout: [
        "Electroencephalography (EEG)",
        "Brain-Computer Interfaces",
        "Deep Learning",
        "Cognitive Load",
        "Emotion Recognition",
        "Imagined Speech Decoding",
      ],
      sameAs: [
        "https://www.linkedin.com/in/tanvir-hossain-ovi/",
        "https://github.com/tanvir-ovi",
        "https://scholar.google.com/citations?user=n8SuOHUAAAAJ&hl=en",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Tanvir Hossain Ovi",
      description:
        "Portfolio, publications, and projects of Tanvir Hossain Ovi, EEG and brain-computer interface researcher.",
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: SITE_URL,
      name: "Tanvir Hossain Ovi | EEG & BCI Researcher",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#person` },
      mainEntity: { "@id": `${SITE_URL}/#person` },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-contrast"
        >
          Skip to content
        </a>
        <MotionProvider>
          <Nav />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
