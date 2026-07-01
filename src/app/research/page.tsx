import type { Metadata } from "next";
import { publications } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { PublicationCard } from "@/components/research/PublicationCard";
import { CtaBanner } from "@/components/CtaBanner";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Peer-reviewed publications on EEG-based cognitive load, emotion recognition, biometrics, and imagined speech decoding.",
};

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Publications"
        title="Eight papers on what EEG reveals, and what it hides"
        description="From cognitive load in virtual reality to the frequency bands that separate mental state from personal identity, this is the published and in-progress work that shapes my research direction."
      />
      <section className="py-20 sm:py-24">
        <Container>
          <div className="border-t border-border">
            {publications.map((pub, i) => (
              <PublicationCard key={pub.id} pub={pub} delay={Math.min(i * 0.05, 0.25)} />
            ))}
          </div>
        </Container>
      </section>
      <CtaBanner
        title="Curious about the methods behind these results?"
        description="Happy to walk through preprocessing pipelines, model architectures, or statistical design for any of these studies."
      />
    </>
  );
}
