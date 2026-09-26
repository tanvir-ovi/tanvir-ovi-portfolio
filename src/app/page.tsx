import { Hero } from "@/components/home/Hero";
import { ResearchSnapshot } from "@/components/home/ResearchSnapshot";
import { FocusAreas } from "@/components/home/FocusAreas";
import { FeaturedPublications } from "@/components/home/FeaturedPublications";
import { ExperimentGallery } from "@/components/home/ExperimentGallery";
import { SelectedBuilds } from "@/components/home/SelectedBuilds";
import { NeuralDive } from "@/components/home/NeuralDive";
import { KineticBand } from "@/components/home/KineticBand";
import { Recognition } from "@/components/home/Recognition";
import { CtaBanner } from "@/components/CtaBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <ResearchSnapshot />
      <NeuralDive />
      <FocusAreas />
      <KineticBand />
      <FeaturedPublications />
      <ExperimentGallery />
      <Recognition />
      <SelectedBuilds />
      <CtaBanner />
    </>
  );
}
