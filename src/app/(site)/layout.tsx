import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { site } from "@/lib/data";

const { seo, profile } = site;
const SITE_URL = seo.siteUrl;

// Structured data (JSON-LD): a linked graph of Person + WebSite + ProfilePage
// so search engines resolve "Tanvir Hossain Ovi" / "Tanvir Ovi" to this site.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: profile.name,
      alternateName: seo.alternateNames,
      givenName: seo.givenName,
      familyName: seo.familyName,
      identifier: {
        "@type": "PropertyValue",
        propertyID: "ORCID",
        value: profile.orcidId,
      },
      url: SITE_URL,
      image: `${SITE_URL}/images/logo.png`,
      jobTitle: profile.role,
      description: seo.personDescription,
      email: `mailto:${profile.email}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: seo.addressLocality,
        addressCountry: seo.addressCountry,
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: seo.alumniOf,
      },
      knowsAbout: seo.knowsAbout,
      sameAs: Object.values(profile.links).filter(Boolean),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: profile.name,
      description: seo.websiteDescription,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: SITE_URL,
      name: seo.title,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#person` },
      mainEntity: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
        <ScrollProgress />
        <Nav />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </MotionProvider>
    </>
  );
}
