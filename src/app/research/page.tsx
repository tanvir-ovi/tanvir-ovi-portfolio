import type { Metadata } from "next";
import { publications } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { PublicationCard } from "@/components/research/PublicationCard";
import { CtaBanner } from "@/components/CtaBanner";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Peer-reviewed publications and ongoing research on EEG-based cognitive load, emotion recognition, biometrics, and imagined speech decoding.",
};

const published = publications.filter(
  (p) => p.status === "Published" || p.status === "Accepted"
);
const ongoing = publications.filter(
  (p) => p.status === "Under Review" || p.status === "Submitted"
);

function GroupHeading({
  title,
  count,
  note,
}: {
  title: string;
  count: number;
  note: string;
}) {
  return (
    <Reveal>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <span className="shrink-0 pb-1 text-sm tabular-nums text-foreground-faint">
          {count} {count === 1 ? "paper" : "papers"}
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted">{note}</p>
    </Reveal>
  );
}

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Eight papers on what EEG reveals, and what it hides"
        description="From cognitive load in virtual reality to the frequency bands that separate mental state from personal identity, this is the published and in-progress work that shapes my research direction."
      />

      <section className="py-20 sm:py-24">
        <Container>
          <GroupHeading
            title="Selected publications"
            count={published.length}
            note="Peer-reviewed journal and conference papers. Select any linked title to read the paper on the publisher's site."
          />
          <div className="mt-8 border-t border-border">
            {published.map((pub, i) => (
              <PublicationCard key={pub.id} pub={pub} delay={Math.min(i * 0.05, 0.2)} />
            ))}
          </div>

          <div className="mt-20">
            <GroupHeading
              title="Selected ongoing research"
              count={ongoing.length}
              note="Manuscripts currently under peer review or submitted for publication. Titles and venues are listed; abstracts are kept private while the work is under review."
            />
            <div className="mt-8 border-t border-border">
              {ongoing.map((pub, i) => (
                <PublicationCard key={pub.id} pub={pub} delay={Math.min(i * 0.05, 0.2)} />
              ))}
            </div>
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
