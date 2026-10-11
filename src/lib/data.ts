// All site copy lives in src/content/site.json, which the /admin editor
// publishes. These named exports keep component imports short.
import raw from "@/content/site.json";
import type { SiteContent } from "./content-types";

export type {
  PubStatus,
  Publication,
  ResearchExperience,
  ResearchAppointment,
  Project,
  ImageRef,
  SiteContent,
} from "./content-types";

export const site = raw as SiteContent;

export const profile = site.profile;
export const navLinks = site.nav.links;
export const stats = site.home.stats;
export const focusAreas = site.home.focus.areas;
export const publications = site.research.publications;
export const researchExperience = site.experience.studies.items;
export const researchAppointments = site.experience.appointments.items;
export const education = site.experience.education;
export const standardisedTests = site.experience.tests.items;
export const honors = site.experience.honors.items;
export const skills = site.experience.skills.groups;
export const referees = site.about.references.referees;
export const projects = site.home.builds.projects;
