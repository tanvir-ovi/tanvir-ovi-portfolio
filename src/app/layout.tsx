import type { Metadata } from "next";
import { IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
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
    "Tanvir Hossain Ovi is an EEG and brain-computer interface researcher working on cognitive load, emotion recognition, and imagined speech decoding.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tanvir Hossain Ovi | EEG & BCI Researcher",
    description:
      "Deep learning systems that decode cognition, emotion, and identity from EEG.",
    type: "website",
    url: SITE_URL,
    siteName: "Tanvir Hossain Ovi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanvir Hossain Ovi | EEG & BCI Researcher",
    description:
      "Deep learning systems that decode cognition, emotion, and identity from EEG.",
  },
};

// Person structured data (JSON-LD) for search engines
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Tanvir Hossain Ovi",
  url: SITE_URL,
  jobTitle: "EEG & Brain-Computer Interface Researcher",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
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
