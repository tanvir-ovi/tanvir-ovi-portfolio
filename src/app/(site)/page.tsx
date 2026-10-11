import { Fragment, type ReactNode } from "react";
import { Hero } from "@/components/home/Hero";
import { ResearchSnapshot } from "@/components/home/ResearchSnapshot";
import { FocusAreas } from "@/components/home/FocusAreas";
import { FeaturedPublications } from "@/components/home/FeaturedPublications";
import { News } from "@/components/home/News";
import { ExperimentGallery } from "@/components/home/ExperimentGallery";
import { SelectedBuilds } from "@/components/home/SelectedBuilds";
import { NeuralDive } from "@/components/home/NeuralDive";
import { KineticBand } from "@/components/home/KineticBand";
import { Recognition } from "@/components/home/Recognition";
import { CtaBanner } from "@/components/CtaBanner";
import { site } from "@/lib/data";
import type { HomeSectionId } from "@/lib/content-types";

// Section order and visibility come from the admin panel (Home > Sections).
const sections: Record<HomeSectionId, () => ReactNode> = {
  snapshot: () => <ResearchSnapshot />,
  insideTheWork: () => <NeuralDive />,
  focus: () => <FocusAreas />,
  kinetic: () => <KineticBand />,
  featured: () => <FeaturedPublications />,
  news: () => <News />,
  gallery: () => <ExperimentGallery />,
  recognition: () => <Recognition />,
  builds: () => <SelectedBuilds />,
  cta: () => <CtaBanner title={site.home.cta.title} description={site.home.cta.description} />,
};

export default function Home() {
  return (
    <>
      <Hero />
      {site.home.sections
        .filter((s) => s.visible && sections[s.id])
        .map((s) => (
          <Fragment key={s.id}>{sections[s.id]()}</Fragment>
        ))}
    </>
  );
}
