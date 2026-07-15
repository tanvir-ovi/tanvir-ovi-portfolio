import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { EducationBlock } from "@/components/experience/EducationBlock";
import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { SkillsGrid } from "@/components/experience/SkillsGrid";
import { HonorsAndTests } from "@/components/experience/HonorsAndTests";
import { CtaBanner } from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Education, research experience, technical skills, and academic honors of Tanvir Hossain Ovi.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="Five years of measuring minds"
        description="From robotics competitions to EEG laboratories, here is the education, research roles, and skills behind the work."
      />
      <EducationBlock />
      <ExperienceTimeline />
      <SkillsGrid />
      <HonorsAndTests />
      <CtaBanner
        title="Want the full picture?"
        description="The complete CV has publication-by-publication detail, references, and contact information."
      />
    </>
  );
}
