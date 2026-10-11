import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { EducationBlock } from "@/components/experience/EducationBlock";
import { AppointmentsBlock } from "@/components/experience/AppointmentsBlock";
import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { SkillsGrid } from "@/components/experience/SkillsGrid";
import { HonorsAndTests } from "@/components/experience/HonorsAndTests";
import { CtaBanner } from "@/components/CtaBanner";
import { site } from "@/lib/data";

const page = site.experience;

export const metadata: Metadata = {
  title: page.seo.title,
  description: page.seo.description,
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeader {...page.header} />
      <EducationBlock />
      <AppointmentsBlock />
      <ExperienceTimeline />
      <SkillsGrid />
      <HonorsAndTests />
      <CtaBanner title={page.cta.title} description={page.cta.description} />
    </>
  );
}
