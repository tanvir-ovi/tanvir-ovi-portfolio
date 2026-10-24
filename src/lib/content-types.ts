// Shape of src/content/site.json. Every word on the public site comes from that
// file, and the /admin editor reads and writes it, so keep the two in step:
// a new field here needs a matching entry in src/components/admin/schema.ts.

export type PubStatus = "Published" | "Accepted" | "Presented" | "Under Review" | "Submitted";
export type Accent = "cyan" | "violet";
export type FactIcon = "location" | "language" | "target" | "school" | "briefcase" | "sparkle";

export interface ImageRef {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position, e.g. "50% 22%". Empty keeps the centre. */
  focus?: string;
}

export interface Heading {
  eyebrow: string;
  title: string;
  description?: string;
}

export interface PageSeo {
  title: string;
  description: string;
}

export interface Cta {
  title: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  status: PubStatus;
  firstAuthor: boolean;
  featured?: boolean;
  url?: string;
  abstract?: string;
}

export interface ResearchExperience {
  id: string;
  title: string;
  period: string;
  bullets: string[];
}

export interface ResearchAppointment {
  id: string;
  role: string;
  lab: string;
  department: string;
  institution: string;
  period: string;
  mode: string;
  bullets: string[];
}

export interface Project {
  name: string;
  kind: string;
  description: string;
  tech: string[];
  accent: Accent;
  url: string;
  repoUrl?: string;
  /** Marks apps whose public link only ever exposes an encrypted lock screen. */
  locked?: boolean;
}

export type HomeSectionId =
  | "snapshot"
  | "insideTheWork"
  | "focus"
  | "kinetic"
  | "featured"
  | "news"
  | "gallery"
  | "recognition"
  | "builds"
  | "cta";

export interface SiteContent {
  profile: {
    name: string;
    shortName: string;
    role: string;
    location: string;
    email: string;
    tagline: string;
    availability: string;
    orcidId: string;
    links: {
      linkedin: string;
      github: string;
      scholar: string;
      researchgate: string;
      orcid: string;
    };
    cvPath: string;
  };
  nav: {
    links: { href: string; label: string }[];
    ctaLabel: string;
    footerNote: string;
  };
  seo: {
    siteUrl: string;
    title: string;
    titleTemplate: string;
    description: string;
    shareDescription: string;
    twitterDescription: string;
    keywords: string[];
    googleVerification: string;
    alternateNames: string[];
    givenName: string;
    familyName: string;
    personDescription: string;
    websiteDescription: string;
    alumniOf: string;
    addressLocality: string;
    addressCountry: string;
    knowsAbout: string[];
  };
  home: {
    sections: { id: HomeSectionId; visible: boolean }[];
    hero: {
      overline: string;
      line1: string;
      line2: string;
      intro: string;
      primaryLabel: string;
      primaryHref: string;
      cvLabel: string;
      scrollCue: string;
    };
    stats: { label: string; value: string }[];
    insideTheWork: {
      heading: string;
      beats: { kicker: string; title: string; body: string }[];
    };
    focus: Heading & { areas: { title: string; description: string }[] };
    kinetic: { rowA: string[]; rowB: string[] };
    featured: { eyebrow: string; title: string; allLabel: string };
    news: Heading & { items: { date: string; text: string; link: string }[] };
    gallery: Heading & {
      items: { image: ImageRef; tag: string; label: string; detail: string; accent: Accent }[];
    };
    recognition: Heading & {
      lead: { image: ImageRef; meta: string; title: string; subtitle: string };
      photos: ImageRef[];
      card: { meta: string; title: string; subtitle: string; chips: string[] };
    };
    builds: Heading & { projects: Project[] };
    cta: Cta;
  };
  research: {
    seo: PageSeo;
    header: Required<Heading>;
    published: { title: string; note: string };
    ongoing: { title: string; note: string };
    cta: Cta;
    publications: Publication[];
  };
  experience: {
    seo: PageSeo;
    header: Required<Heading>;
    education: {
      eyebrow: string;
      title: string;
      institution: string;
      degree: string;
      period: string;
      cgpaLabel: string;
      cgpa: string;
      meritLabel: string;
      merit: string;
      thesisLabel: string;
      thesis: string;
    };
    appointments: { eyebrow: string; title: string; items: ResearchAppointment[] };
    studies: { eyebrow: string; title: string; items: ResearchExperience[] };
    skills: { eyebrow: string; title: string; groups: { category: string; items: string[] }[] };
    honors: { eyebrow: string; title: string; items: { title: string; venue: string; date: string }[] };
    tests: {
      eyebrow: string;
      title: string;
      items: {
        name: string;
        date: string;
        overall: string;
        overallLabel: string;
        breakdown: { label: string; score: string }[];
      }[];
    };
    cta: Cta;
  };
  about: {
    seo: PageSeo;
    header: Required<Heading>;
    bio: string[];
    portrait: ImageRef;
    thesis: { visible: boolean; image: ImageRef; quote: string; body: string };
    facts: { icon: FactIcon; label: string; value: string }[];
    cvPrompt: string;
    cvButton: string;
    references: {
      visible: boolean;
      eyebrow: string;
      title: string;
      referees: { name: string; title: string; institution: string; relation: string; email: string }[];
    };
    cta: Cta;
  };
  contact: {
    seo: PageSeo;
    header: Required<Heading>;
    successTitle: string;
    successBody: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
  };
}
