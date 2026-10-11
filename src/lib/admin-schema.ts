/* Editor schema for src/content/site.json. It drives both the admin forms and
 * the validation that runs before anything is published, so a field that is
 * not described here cannot be edited from /admin (it is still preserved).
 * Keys are relative to the panel `root` or to the enclosing list item.
 * Pure data: imported by the browser editor and by the API routes. */

export type Format = "url" | "email" | "slug" | "focus";

export type Field =
  | {
      type: "text";
      key: string;
      label: string;
      help?: string;
      required?: boolean;
      placeholder?: string;
      format?: Format;
      autoFrom?: string;
    }
  | { type: "textarea"; key: string; label: string; help?: string; required?: boolean; rows?: number }
  | { type: "toggle"; key: string; label: string; help?: string }
  | { type: "select"; key: string; label: string; help?: string; options: { value: string; label: string }[] }
  | { type: "tags"; key: string; label: string; help?: string }
  | { type: "paragraphs"; key: string; label: string; help?: string; itemLabel: string; rows?: number }
  | {
      type: "list";
      key: string;
      label: string;
      help?: string;
      itemLabel: string;
      titleKey?: string;
      subtitleKey?: string;
      fields: Field[];
      newItem: Record<string, unknown>;
      max?: number;
    }
  | { type: "image"; key: string; label: string; help?: string; focus?: boolean }
  | { type: "object"; key: string; label: string; help?: string; fields: Field[] }
  | { type: "sections"; key: string; label: string; help?: string };

export type PanelIcon =
  | "user"
  | "compass"
  | "search"
  | "layout"
  | "star"
  | "chart"
  | "film"
  | "target"
  | "text"
  | "book"
  | "news"
  | "image"
  | "trophy"
  | "code"
  | "megaphone"
  | "briefcase"
  | "flask"
  | "wrench"
  | "medal"
  | "school"
  | "pen"
  | "info"
  | "users"
  | "mail";

export interface Panel {
  id: string;
  group: string;
  title: string;
  description: string;
  icon: PanelIcon;
  root: string;
  fields: Field[];
  /** Where the panel's content shows up, for the "View on site" link. */
  href: string;
}

const accentOptions = [
  { value: "cyan", label: "Cyan" },
  { value: "violet", label: "Violet" },
];

const header = (help?: string): Field => ({
  type: "object",
  key: "header",
  label: "Page header",
  help,
  fields: [
    { type: "text", key: "eyebrow", label: "Small label above the title", required: true },
    { type: "text", key: "title", label: "Title", required: true },
    { type: "textarea", key: "description", label: "Intro paragraph", required: true, rows: 3 },
  ],
});

const pageSeo: Field = {
  type: "object",
  key: "seo",
  label: "Search result for this page",
  help: "What Google and link previews show for this page.",
  fields: [
    { type: "text", key: "title", label: "Browser tab title", required: true },
    { type: "textarea", key: "description", label: "Search description", required: true, rows: 2 },
  ],
};

const cta = (label = "Closing banner"): Field => ({
  type: "object",
  key: "cta",
  label,
  help: "The \"Get in touch / Download CV\" band at the bottom of the page.",
  fields: [
    { type: "text", key: "title", label: "Headline", required: true },
    { type: "textarea", key: "description", label: "Supporting line", required: true, rows: 2 },
  ],
});

const bullets = (label = "Bullet points"): Field => ({
  type: "paragraphs",
  key: "bullets",
  label,
  itemLabel: "Bullet",
  rows: 2,
});

export const panels: Panel[] = [
  // ---------------------------------------------------------------- Site
  {
    id: "profile",
    group: "Site",
    title: "Profile & links",
    description: "Your name, role, contact email and the profile links used across the site.",
    icon: "user",
    root: "profile",
    href: "/contact",
    fields: [
      { type: "text", key: "name", label: "Full name", required: true },
      { type: "text", key: "shortName", label: "Short name", help: "Shown next to the logo in the top bar.", required: true },
      { type: "text", key: "role", label: "Role", required: true },
      { type: "text", key: "location", label: "Location", required: true },
      { type: "text", key: "email", label: "Contact email", required: true, format: "email" },
      { type: "text", key: "availability", label: "Availability line", help: "Shown under the hero buttons, e.g. \"Open to PhD positions\"." },
      { type: "textarea", key: "tagline", label: "One-line summary", rows: 2 },
      { type: "text", key: "orcidId", label: "ORCID iD", placeholder: "0000-0000-0000-0000" },
      {
        type: "object",
        key: "links",
        label: "Profile links",
        help: "Leave a link empty to hide it.",
        fields: [
          { type: "text", key: "scholar", label: "Google Scholar", format: "url" },
          { type: "text", key: "linkedin", label: "LinkedIn", format: "url" },
          { type: "text", key: "github", label: "GitHub", format: "url" },
          { type: "text", key: "researchgate", label: "ResearchGate", format: "url" },
          { type: "text", key: "orcid", label: "ORCID", format: "url" },
        ],
      },
      {
        type: "text",
        key: "cvPath",
        label: "CV file address",
        help: "Replace the PDF itself under Files. Keep this address the same so old links keep working.",
        required: true,
        format: "url",
      },
    ],
  },
  {
    id: "nav",
    group: "Site",
    title: "Menu & footer",
    description: "Top menu links, the menu button and the footer line.",
    icon: "compass",
    root: "nav",
    href: "/",
    fields: [
      {
        type: "list",
        key: "links",
        label: "Menu links",
        itemLabel: "Link",
        titleKey: "label",
        subtitleKey: "href",
        newItem: { href: "/", label: "New link" },
        fields: [
          { type: "text", key: "label", label: "Label", required: true },
          { type: "text", key: "href", label: "Address", required: true, format: "url", help: "A page like /research, a section like /#projects, or a full https:// link." },
        ],
      },
      { type: "text", key: "ctaLabel", label: "Menu button label", required: true },
      { type: "text", key: "footerNote", label: "Footer note", help: "Appears after \"© year, your name.\"" },
    ],
  },
  {
    id: "seo",
    group: "Site",
    title: "Search & sharing",
    description: "How the site appears on Google and when a link is shared.",
    icon: "search",
    root: "seo",
    href: "/",
    fields: [
      { type: "text", key: "title", label: "Site title", required: true },
      { type: "text", key: "titleTemplate", label: "Title pattern for inner pages", help: "%s is replaced by the page name.", required: true },
      { type: "textarea", key: "description", label: "Search description", required: true, rows: 3 },
      { type: "textarea", key: "shareDescription", label: "Link preview description", required: true, rows: 2 },
      { type: "textarea", key: "twitterDescription", label: "X / Twitter card description", required: true, rows: 2 },
      { type: "tags", key: "keywords", label: "Keywords" },
      { type: "tags", key: "alternateNames", label: "Other names people search for" },
      { type: "text", key: "givenName", label: "Given name" },
      { type: "text", key: "familyName", label: "Family name" },
      { type: "textarea", key: "personDescription", label: "About you (for search engines)", rows: 2 },
      { type: "textarea", key: "websiteDescription", label: "About the site (for search engines)", rows: 2 },
      { type: "text", key: "alumniOf", label: "University" },
      { type: "text", key: "addressLocality", label: "City" },
      { type: "text", key: "addressCountry", label: "Country" },
      { type: "tags", key: "knowsAbout", label: "Research topics" },
      { type: "text", key: "siteUrl", label: "Site address", required: true, format: "url", help: "Only change this if the domain changes." },
      { type: "text", key: "googleVerification", label: "Google Search Console code" },
    ],
  },

  // ---------------------------------------------------------------- Home
  {
    id: "home-layout",
    group: "Home page",
    title: "Section order",
    description: "Show, hide and reorder the sections under the hero.",
    icon: "layout",
    root: "home",
    href: "/",
    fields: [{ type: "sections", key: "sections", label: "Sections", help: "The hero always comes first." }],
  },
  {
    id: "home-hero",
    group: "Home page",
    title: "Hero",
    description: "The first screen: headline, introduction and buttons.",
    icon: "star",
    root: "home.hero",
    href: "/",
    fields: [
      { type: "text", key: "overline", label: "Line above the headline", required: true },
      { type: "text", key: "line1", label: "Headline, first line", required: true },
      { type: "text", key: "line2", label: "Headline, second line", required: true, help: "Wrap a word in *asterisks* to give it the gradient italic." },
      { type: "textarea", key: "intro", label: "Introduction", required: true, rows: 4 },
      { type: "text", key: "primaryLabel", label: "Main button label", required: true },
      { type: "text", key: "primaryHref", label: "Main button address", required: true, format: "url" },
      { type: "text", key: "cvLabel", label: "CV button label", required: true, help: "Also used on the closing banners." },
      { type: "text", key: "scrollCue", label: "Scroll hint" },
    ],
  },
  {
    id: "home-stats",
    group: "Home page",
    title: "Numbers strip",
    description: "The four headline numbers under the hero.",
    icon: "chart",
    root: "home",
    href: "/",
    fields: [
      {
        type: "list",
        key: "stats",
        label: "Numbers",
        itemLabel: "Number",
        titleKey: "value",
        subtitleKey: "label",
        newItem: { label: "Label", value: "0" },
        max: 4,
        help: "Plain numbers count up when they scroll into view. Values with a slash, like 3.78/4.0, appear as written.",
        fields: [
          { type: "text", key: "value", label: "Value", required: true },
          { type: "text", key: "label", label: "Label", required: true },
        ],
      },
    ],
  },
  {
    id: "home-dive",
    group: "Home page",
    title: "Inside the work",
    description: "The scroll-driven video section with four short beats.",
    icon: "film",
    root: "home.insideTheWork",
    href: "/#inside-the-work",
    fields: [
      { type: "text", key: "heading", label: "Section label", required: true },
      {
        type: "list",
        key: "beats",
        label: "Beats",
        itemLabel: "Beat",
        titleKey: "title",
        subtitleKey: "kicker",
        newItem: { kicker: "05 · Step", title: "", body: "" },
        max: 6,
        fields: [
          { type: "text", key: "kicker", label: "Kicker", required: true },
          { type: "text", key: "title", label: "Title", required: true },
          { type: "textarea", key: "body", label: "Text", required: true, rows: 3 },
        ],
      },
    ],
  },
  {
    id: "home-focus",
    group: "Home page",
    title: "Research focus",
    description: "The numbered list of research questions.",
    icon: "target",
    root: "home.focus",
    href: "/",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Title", required: true },
      { type: "textarea", key: "description", label: "Intro", rows: 3 },
      {
        type: "list",
        key: "areas",
        label: "Focus areas",
        itemLabel: "Area",
        titleKey: "title",
        newItem: { title: "", description: "" },
        fields: [
          { type: "text", key: "title", label: "Title", required: true },
          { type: "textarea", key: "description", label: "Description", required: true, rows: 3 },
        ],
      },
    ],
  },
  {
    id: "home-kinetic",
    group: "Home page",
    title: "Moving words",
    description: "The two oversized rows of research words that slide as you scroll.",
    icon: "text",
    root: "home.kinetic",
    href: "/",
    fields: [
      { type: "tags", key: "rowA", label: "First row" },
      { type: "tags", key: "rowB", label: "Second row (outlined)" },
    ],
  },
  {
    id: "home-featured",
    group: "Home page",
    title: "Featured publications",
    description: "Heading of the home publication list. Pick the papers with \"Feature on home page\" under Publications.",
    icon: "book",
    root: "home.featured",
    href: "/",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Title", required: true },
      { type: "text", key: "allLabel", label: "Link to all publications", required: true, help: "{count} becomes the number of publications." },
    ],
  },
  {
    id: "home-news",
    group: "Home page",
    title: "News",
    description: "Dated milestones: papers, awards, new positions. Newest first.",
    icon: "news",
    root: "home.news",
    href: "/",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Title", required: true },
      { type: "textarea", key: "description", label: "Intro (optional)", rows: 2 },
      {
        type: "list",
        key: "items",
        label: "News items",
        itemLabel: "Item",
        titleKey: "text",
        subtitleKey: "date",
        newItem: { date: "", text: "", link: "" },
        fields: [
          { type: "text", key: "date", label: "Date", required: true, placeholder: "Oct 2026" },
          { type: "textarea", key: "text", label: "What happened", required: true, rows: 2 },
          { type: "text", key: "link", label: "Link (optional)", format: "url", help: "e.g. /research#paper-id or a full https:// link." },
        ],
      },
    ],
  },
  {
    id: "home-gallery",
    group: "Home page",
    title: "Experiment photos",
    description: "The two photos of the experimental setup.",
    icon: "image",
    root: "home.gallery",
    href: "/",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Title", required: true },
      { type: "textarea", key: "description", label: "Intro", rows: 3 },
      {
        type: "list",
        key: "items",
        label: "Photos",
        itemLabel: "Photo",
        titleKey: "label",
        subtitleKey: "tag",
        newItem: { image: { src: "", width: 800, height: 800, alt: "" }, tag: "", label: "", detail: "", accent: "cyan" },
        max: 4,
        fields: [
          { type: "image", key: "image", label: "Photo", help: "Cut-outs on a transparent background look best." },
          { type: "text", key: "tag", label: "Corner tag" },
          { type: "text", key: "label", label: "Caption", required: true },
          { type: "text", key: "detail", label: "Detail line" },
          { type: "select", key: "accent", label: "Glow colour", options: accentOptions },
        ],
      },
    ],
  },
  {
    id: "home-recognition",
    group: "Home page",
    title: "Recognition",
    description: "Award photos: one large lead photo, three smaller frames and a caption card.",
    icon: "trophy",
    root: "home.recognition",
    href: "/",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Title", required: true },
      { type: "textarea", key: "description", label: "Intro", rows: 3 },
      {
        type: "object",
        key: "lead",
        label: "Lead photo",
        fields: [
          { type: "image", key: "image", label: "Photo", focus: true },
          { type: "text", key: "meta", label: "Date and place", required: true },
          { type: "text", key: "title", label: "Award", required: true, help: "Wrap words in *asterisks* for the gradient italic." },
          { type: "text", key: "subtitle", label: "Line under the award" },
        ],
      },
      {
        type: "list",
        key: "photos",
        label: "Smaller frames",
        itemLabel: "Frame",
        titleKey: "alt",
        newItem: { src: "", width: 800, height: 1000, alt: "", focus: "" },
        max: 3,
        help: "Exactly three frames fit the layout. The third is hidden on phones.",
        fields: [{ type: "image", key: "", label: "Photo", focus: true }],
      },
      {
        type: "object",
        key: "card",
        label: "Caption card",
        fields: [
          { type: "text", key: "meta", label: "Date and place" },
          { type: "text", key: "title", label: "Title", required: true },
          { type: "text", key: "subtitle", label: "Line under the title" },
          { type: "tags", key: "chips", label: "Other awards (chips)" },
        ],
      },
    ],
  },
  {
    id: "home-builds",
    group: "Home page",
    title: "Projects",
    description: "Software you have built, shown as cards.",
    icon: "code",
    root: "home.builds",
    href: "/#projects",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Title", required: true },
      { type: "textarea", key: "description", label: "Intro", rows: 3 },
      {
        type: "list",
        key: "projects",
        label: "Projects",
        itemLabel: "Project",
        titleKey: "name",
        subtitleKey: "kind",
        newItem: { name: "", kind: "", description: "", tech: [], accent: "cyan", url: "", locked: false },
        fields: [
          { type: "text", key: "name", label: "Name", required: true },
          { type: "text", key: "kind", label: "Kind", help: "e.g. \"Encrypted personal dashboard\"." },
          { type: "textarea", key: "description", label: "Description", required: true, rows: 3 },
          { type: "tags", key: "tech", label: "Technologies" },
          { type: "text", key: "url", label: "Live link", format: "url" },
          { type: "select", key: "accent", label: "Accent colour", options: accentOptions },
          { type: "toggle", key: "locked", label: "Encrypted app", help: "Shows an \"Encrypted\" badge instead of \"Live\"." },
        ],
      },
    ],
  },
  {
    id: "home-cta",
    group: "Home page",
    title: "Closing banner",
    description: "The invitation at the bottom of the home page (also used as the default elsewhere).",
    icon: "megaphone",
    root: "home",
    href: "/",
    fields: [cta("Banner")],
  },

  // ---------------------------------------------------------------- Research
  {
    id: "research-pubs",
    group: "Research",
    title: "Publications",
    description: "Every paper and manuscript. Published and accepted papers show their abstract and link; the rest list only title and venue.",
    icon: "book",
    root: "research",
    href: "/research",
    fields: [
      {
        type: "list",
        key: "publications",
        label: "Publications",
        itemLabel: "Publication",
        titleKey: "title",
        subtitleKey: "status",
        newItem: {
          id: "",
          title: "",
          authors: "T. H. Ovi",
          venue: "",
          year: String(new Date().getFullYear()),
          status: "Submitted",
          firstAuthor: true,
          featured: false,
          url: "",
          abstract: "",
        },
        fields: [
          { type: "text", key: "title", label: "Title", required: true },
          { type: "text", key: "authors", label: "Authors", required: true },
          { type: "text", key: "venue", label: "Journal or conference", required: true },
          { type: "text", key: "year", label: "Year", required: true },
          {
            type: "select",
            key: "status",
            label: "Status",
            options: [
              { value: "Published", label: "Published" },
              { value: "Accepted", label: "Accepted" },
              { value: "Under Review", label: "Under review" },
              { value: "Submitted", label: "Submitted" },
            ],
          },
          { type: "toggle", key: "firstAuthor", label: "First author" },
          { type: "toggle", key: "featured", label: "Feature on home page" },
          { type: "text", key: "url", label: "Paper link", format: "url" },
          { type: "textarea", key: "abstract", label: "Abstract", rows: 5, help: "Shown only once the paper is Published or Accepted." },
          { type: "text", key: "id", label: "Anchor id", required: true, format: "slug", autoFrom: "title", help: "Used in links like /research#anchor-id. Filled from the title if left empty." },
        ],
      },
    ],
  },
  {
    id: "research-page",
    group: "Research",
    title: "Research page text",
    description: "Header, group headings and closing banner of the Research page.",
    icon: "pen",
    root: "research",
    href: "/research",
    fields: [
      header(),
      {
        type: "object",
        key: "published",
        label: "Published group",
        fields: [
          { type: "text", key: "title", label: "Heading", required: true },
          { type: "textarea", key: "note", label: "Note", rows: 2 },
        ],
      },
      {
        type: "object",
        key: "ongoing",
        label: "In-progress group",
        fields: [
          { type: "text", key: "title", label: "Heading", required: true },
          { type: "textarea", key: "note", label: "Note", rows: 2 },
        ],
      },
      cta(),
      pageSeo,
    ],
  },

  // ---------------------------------------------------------------- Experience
  {
    id: "experience-education",
    group: "Experience",
    title: "Page & education",
    description: "Experience page header and the education block.",
    icon: "school",
    root: "experience",
    href: "/experience",
    fields: [
      header(),
      {
        type: "object",
        key: "education",
        label: "Education",
        fields: [
          { type: "text", key: "eyebrow", label: "Small label", required: true },
          { type: "text", key: "title", label: "Heading", required: true },
          { type: "text", key: "institution", label: "Institution", required: true },
          { type: "text", key: "degree", label: "Degree", required: true },
          { type: "text", key: "period", label: "Period", required: true },
          { type: "text", key: "cgpaLabel", label: "Grade label" },
          { type: "text", key: "cgpa", label: "Grade" },
          { type: "text", key: "meritLabel", label: "Rank label" },
          { type: "text", key: "merit", label: "Rank" },
          { type: "text", key: "thesisLabel", label: "Thesis label" },
          { type: "textarea", key: "thesis", label: "Thesis", rows: 2 },
        ],
      },
      cta(),
      pageSeo,
    ],
  },
  {
    id: "experience-appointments",
    group: "Experience",
    title: "Research appointments",
    description: "Lab positions, newest first.",
    icon: "briefcase",
    root: "experience.appointments",
    href: "/experience",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Heading", required: true },
      {
        type: "list",
        key: "items",
        label: "Appointments",
        itemLabel: "Appointment",
        titleKey: "lab",
        subtitleKey: "period",
        newItem: { id: "", role: "", lab: "", department: "", institution: "", period: "", mode: "Remote", bullets: [] },
        fields: [
          { type: "text", key: "role", label: "Role", required: true },
          { type: "text", key: "lab", label: "Lab", required: true },
          { type: "text", key: "department", label: "Department" },
          { type: "text", key: "institution", label: "Institution", required: true },
          { type: "text", key: "period", label: "Period", required: true },
          { type: "text", key: "mode", label: "Mode", help: "e.g. Remote, In person." },
          bullets(),
          { type: "text", key: "id", label: "Internal id", required: true, format: "slug", autoFrom: "lab" },
        ],
      },
    ],
  },
  {
    id: "experience-studies",
    group: "Experience",
    title: "Research experience",
    description: "The study-by-study timeline.",
    icon: "flask",
    root: "experience.studies",
    href: "/experience",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Heading", required: true },
      {
        type: "list",
        key: "items",
        label: "Studies",
        itemLabel: "Study",
        titleKey: "title",
        subtitleKey: "period",
        newItem: { id: "", title: "", period: "", bullets: [] },
        fields: [
          { type: "text", key: "title", label: "Title", required: true },
          { type: "text", key: "period", label: "Period", required: true },
          bullets(),
          { type: "text", key: "id", label: "Internal id", required: true, format: "slug", autoFrom: "title" },
        ],
      },
    ],
  },
  {
    id: "experience-skills",
    group: "Experience",
    title: "Skills",
    description: "Skill groups shown as tags.",
    icon: "wrench",
    root: "experience.skills",
    href: "/experience",
    fields: [
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Heading", required: true },
      {
        type: "list",
        key: "groups",
        label: "Skill groups",
        itemLabel: "Group",
        titleKey: "category",
        newItem: { category: "", items: [] },
        fields: [
          { type: "text", key: "category", label: "Group name", required: true },
          { type: "tags", key: "items", label: "Skills" },
        ],
      },
    ],
  },
  {
    id: "experience-honors",
    group: "Experience",
    title: "Honors & tests",
    description: "Awards list and language test scores.",
    icon: "medal",
    root: "experience",
    href: "/experience",
    fields: [
      {
        type: "object",
        key: "honors",
        label: "Honors & awards",
        fields: [
          { type: "text", key: "eyebrow", label: "Small label", required: true },
          { type: "text", key: "title", label: "Heading", required: true },
          {
            type: "list",
            key: "items",
            label: "Awards",
            itemLabel: "Award",
            titleKey: "title",
            subtitleKey: "date",
            newItem: { title: "", venue: "", date: "" },
            fields: [
              { type: "text", key: "title", label: "Award", required: true },
              { type: "text", key: "venue", label: "Where" },
              { type: "text", key: "date", label: "Date" },
            ],
          },
        ],
      },
      {
        type: "object",
        key: "tests",
        label: "Standardised tests",
        fields: [
          { type: "text", key: "eyebrow", label: "Small label", required: true },
          { type: "text", key: "title", label: "Heading", required: true },
          {
            type: "list",
            key: "items",
            label: "Tests",
            itemLabel: "Test",
            titleKey: "name",
            subtitleKey: "overall",
            newItem: { name: "", date: "", overall: "", overallLabel: "overall score", breakdown: [] },
            fields: [
              { type: "text", key: "name", label: "Test", required: true },
              { type: "text", key: "date", label: "Date" },
              { type: "text", key: "overall", label: "Overall score", required: true },
              { type: "text", key: "overallLabel", label: "Label after the score" },
              {
                type: "list",
                key: "breakdown",
                label: "Section scores",
                itemLabel: "Section",
                titleKey: "label",
                subtitleKey: "score",
                newItem: { label: "", score: "" },
                max: 4,
                fields: [
                  { type: "text", key: "label", label: "Section", required: true },
                  { type: "text", key: "score", label: "Score", required: true },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- About
  {
    id: "about-bio",
    group: "About",
    title: "Story & photos",
    description: "About page header, your story, portrait and the thesis band.",
    icon: "pen",
    root: "about",
    href: "/about",
    fields: [
      header(),
      { type: "paragraphs", key: "bio", label: "Your story", itemLabel: "Paragraph", rows: 5 },
      { type: "image", key: "portrait", label: "Portrait", help: "Shown at 4:5, cropped from the top.", focus: true },
      {
        type: "object",
        key: "thesis",
        label: "Thesis band",
        fields: [
          { type: "toggle", key: "visible", label: "Show the thesis band" },
          { type: "image", key: "image", label: "Photo", focus: true },
          { type: "textarea", key: "quote", label: "Title (shown in quotes)", rows: 2 },
          { type: "textarea", key: "body", label: "Text", rows: 4 },
        ],
      },
      pageSeo,
    ],
  },
  {
    id: "about-facts",
    group: "About",
    title: "Quick facts & CV",
    description: "The three facts strip and the CV download prompt.",
    icon: "info",
    root: "about",
    href: "/about",
    fields: [
      {
        type: "list",
        key: "facts",
        label: "Facts",
        itemLabel: "Fact",
        titleKey: "label",
        subtitleKey: "value",
        newItem: { icon: "sparkle", label: "", value: "" },
        max: 3,
        fields: [
          {
            type: "select",
            key: "icon",
            label: "Icon",
            options: [
              { value: "location", label: "Location pin" },
              { value: "language", label: "Speech bubble" },
              { value: "target", label: "Target" },
              { value: "school", label: "Graduation cap" },
              { value: "briefcase", label: "Briefcase" },
              { value: "sparkle", label: "Sparkle" },
            ],
          },
          { type: "text", key: "label", label: "Label", required: true },
          { type: "text", key: "value", label: "Value", required: true },
        ],
      },
      { type: "text", key: "cvPrompt", label: "CV prompt" },
      { type: "text", key: "cvButton", label: "CV button label", required: true },
      cta(),
    ],
  },
  {
    id: "about-references",
    group: "About",
    title: "References",
    description: "Referees listed on the About page.",
    icon: "users",
    root: "about.references",
    href: "/about",
    fields: [
      { type: "toggle", key: "visible", label: "Show the references section" },
      { type: "text", key: "eyebrow", label: "Small label", required: true },
      { type: "text", key: "title", label: "Heading", required: true },
      {
        type: "list",
        key: "referees",
        label: "Referees",
        itemLabel: "Referee",
        titleKey: "name",
        subtitleKey: "relation",
        newItem: { name: "", title: "", institution: "", relation: "", email: "" },
        fields: [
          { type: "text", key: "name", label: "Name", required: true },
          { type: "text", key: "title", label: "Position", required: true },
          { type: "text", key: "institution", label: "Institution", required: true },
          { type: "text", key: "relation", label: "Relation", help: "e.g. Research Supervisor." },
          { type: "text", key: "email", label: "Email", required: true, format: "email" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- Contact
  {
    id: "contact",
    group: "Contact",
    title: "Contact page",
    description: "Header, form placeholders and the thank-you message.",
    icon: "mail",
    root: "contact",
    href: "/contact",
    fields: [
      header(),
      { type: "text", key: "subjectPlaceholder", label: "Subject placeholder" },
      { type: "text", key: "messagePlaceholder", label: "Message placeholder" },
      { type: "text", key: "successTitle", label: "After sending: title", required: true },
      { type: "text", key: "successBody", label: "After sending: text" },
      pageSeo,
    ],
  },
];

export const HOME_SECTIONS: { id: string; label: string }[] = [
  { id: "snapshot", label: "Numbers strip" },
  { id: "insideTheWork", label: "Inside the work (video)" },
  { id: "focus", label: "Research focus" },
  { id: "kinetic", label: "Moving words" },
  { id: "featured", label: "Featured publications" },
  { id: "news", label: "News" },
  { id: "gallery", label: "Experiment photos" },
  { id: "recognition", label: "Recognition" },
  { id: "builds", label: "Projects" },
  { id: "cta", label: "Closing banner" },
];

// ------------------------------------------------------------- path helpers

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export function getPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/** Immutable set: returns a copy of `obj` with `path` replaced. */
export function setPath<T>(obj: T, path: string, value: unknown): T {
  if (!path) return value as T;
  const [head, ...rest] = path.split(".");
  const base = (obj ?? {}) as Record<string, unknown> | unknown[];
  const next = Array.isArray(base) ? [...base] : { ...base };
  (next as Record<string, unknown>)[head] = setPath(
    (base as Record<string, unknown>)[head],
    rest.join("."),
    value
  );
  return next as T;
}

export function joinPath(...parts: (string | number)[]): string {
  return parts.filter((p) => p !== "").join(".");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// --------------------------------------------------------------- validation

export interface Problem {
  path: string;
  panel: string;
  message: string;
}

const isUrl = (v: string) =>
  /^(https?:\/\/[^\s]+|\/[^\s]*|#[^\s]*|mailto:[^\s]+)$/.test(v);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function checkFields(fields: Field[], value: unknown, base: string, panel: string, out: Problem[]) {
  for (const field of fields) {
    const path = joinPath(base, field.key);
    const v = field.key ? getPath(value, field.key) : value;
    const label = field.label;
    const add = (message: string) => out.push({ path, panel, message: `${label}: ${message}` });

    switch (field.type) {
      case "text":
      case "textarea": {
        if (typeof v !== "string") {
          add("must be text");
          break;
        }
        if (field.required && !v.trim()) add("is required");
        if (field.type === "text" && v.trim() && field.format) {
          if (field.format === "url" && !isUrl(v.trim())) add("is not a valid link (start with https://, / or #)");
          if (field.format === "email" && !isEmail(v.trim())) add("is not a valid email address");
          if (field.format === "slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) add("use lowercase letters, numbers and dashes only");
        }
        break;
      }
      case "toggle":
        if (v !== undefined && typeof v !== "boolean") add("must be on or off");
        break;
      case "select":
        if (!field.options.some((o) => o.value === v)) add("pick one of the options");
        break;
      case "tags":
      case "paragraphs":
        if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) add("must be a list of text");
        break;
      case "image": {
        const img = v as Record<string, unknown> | undefined;
        if (!img || typeof img !== "object") {
          add("is missing");
          break;
        }
        if (typeof img.src !== "string" || !img.src) add("needs a picture");
        else if (!isUrl(img.src)) add("has an invalid picture address");
        if (typeof img.width !== "number" || typeof img.height !== "number" || img.width <= 0 || img.height <= 0)
          add("needs a width and height");
        if (typeof img.alt !== "string") add("needs a description");
        break;
      }
      case "object":
        if (!v || typeof v !== "object" || Array.isArray(v)) add("is missing");
        else checkFields(field.fields, v, path, panel, out);
        break;
      case "list":
        if (!Array.isArray(v)) {
          add("must be a list");
          break;
        }
        if (field.max && v.length > field.max) add(`can hold at most ${field.max}`);
        v.forEach((item, i) => checkFields(field.fields, item, joinPath(path, i), panel, out));
        break;
      case "sections": {
        if (!Array.isArray(v)) {
          add("must be a list");
          break;
        }
        const known = new Set(HOME_SECTIONS.map((s) => s.id));
        for (const s of v as { id?: string; visible?: unknown }[]) {
          if (!s || !known.has(String(s.id))) add(`unknown section "${s?.id}"`);
          else if (typeof s.visible !== "boolean") add(`"${s.id}" needs on or off`);
        }
        break;
      }
    }
  }
}

/** Errors that block publishing. */
export function validateContent(content: unknown): Problem[] {
  const out: Problem[] = [];
  if (!content || typeof content !== "object") return [{ path: "", panel: "", message: "Content is empty" }];
  for (const panel of panels) {
    const value = getPath(content, panel.root);
    if (value === undefined) {
      out.push({ path: panel.root, panel: panel.id, message: `${panel.title}: section is missing` });
      continue;
    }
    checkFields(panel.fields, value, panel.root, panel.id, out);
  }
  // Publication anchors must be unique or links jump to the wrong paper.
  const pubs = (getPath(content, "research.publications") as { id?: string }[]) ?? [];
  const seen = new Set<string>();
  pubs.forEach((p, i) => {
    if (p?.id && seen.has(p.id))
      out.push({ path: `research.publications.${i}.id`, panel: "research-pubs", message: `Publications: anchor id "${p.id}" is used twice` });
    if (p?.id) seen.add(p.id);
  });
  // De-duplicate (shared objects like page headers can repeat a message).
  return out.filter((p, i) => out.findIndex((q) => q.path === p.path && q.message === p.message) === i);
}

/** Soft warnings shown on the overview; they never block publishing. */
export function lintContent(content: unknown): Problem[] {
  const out: Problem[] = [];
  const c = content as Record<string, never>;
  const pubs = (getPath(c, "research.publications") as Record<string, unknown>[]) ?? [];
  pubs.forEach((p, i) => {
    if (p.status === "Published" && !p.url)
      out.push({ path: `research.publications.${i}.url`, panel: "research-pubs", message: `"${String(p.title).slice(0, 60)}…" is Published but has no paper link.` });
  });
  if (!pubs.some((p) => p.featured))
    out.push({ path: "research.publications", panel: "research-pubs", message: "No publication is featured, so the home page publication list is empty." });
  const stats = (getPath(c, "home.stats") as { label: string; value: string }[]) ?? [];
  const pubStat = stats.find((s) => /^publications?$/i.test(s.label.trim()));
  if (pubStat && Number(pubStat.value) !== pubs.length)
    out.push({ path: "home.stats", panel: "home-stats", message: `The numbers strip says ${pubStat.value} publications, but the list has ${pubs.length}.` });
  const published = pubs.filter((p) => p.status === "Published").length;
  const journalStat = stats.find((s) => /published/i.test(s.label));
  if (journalStat && Number(journalStat.value) > published)
    out.push({ path: "home.stats", panel: "home-stats", message: `The numbers strip says ${journalStat.value} published papers, but only ${published} are marked Published.` });

  const images: [string, string, unknown][] = [
    ["about.portrait", "about-bio", getPath(c, "about.portrait")],
    ["about.thesis.image", "about-bio", getPath(c, "about.thesis.image")],
    ["home.recognition.lead.image", "home-recognition", getPath(c, "home.recognition.lead.image")],
    ...((getPath(c, "home.recognition.photos") as unknown[]) ?? []).map(
      (img, i) => [`home.recognition.photos.${i}`, "home-recognition", img] as [string, string, unknown]
    ),
    ...((getPath(c, "home.gallery.items") as { image: unknown }[]) ?? []).map(
      (it, i) => [`home.gallery.items.${i}.image`, "home-gallery", it.image] as [string, string, unknown]
    ),
  ];
  for (const [path, panel, img] of images) {
    const alt = (img as { alt?: string } | undefined)?.alt ?? "";
    if (!alt.trim()) out.push({ path, panel, message: "A photo has no description (alt text), which screen readers and Google rely on." });
  }
  const news = (getPath(c, "home.news.items") as { date: string }[]) ?? [];
  const visibleNews = ((getPath(c, "home.sections") as { id: string; visible: boolean }[]) ?? []).find((s) => s.id === "news")?.visible;
  if (visibleNews && news.length === 0)
    out.push({ path: "home.news.items", panel: "home-news", message: "The News section is switched on but has no items, so it stays hidden." });
  return out;
}
