import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Bio } from "@/components/about/Bio";
import { QuickFacts } from "@/components/about/QuickFacts";
import { References } from "@/components/about/References";
import { CtaBanner } from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Tanvir Hossain Ovi, an EEG and brain-computer interface researcher and BSc graduate from the University of Chittagong.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="From robo soccer to brainwaves"
        description="A bit about how I got here, what I'm working on, and where I'm headed next."
      />
      <Bio />
      <QuickFacts />
      <References />
      <CtaBanner />
    </>
  );
}
