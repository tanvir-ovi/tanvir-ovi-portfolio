import type { Metadata } from "next";
import { publications, site } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { PublicationCard } from "@/components/research/PublicationCard";
import { CtaBanner } from "@/components/CtaBanner";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const page = site.research;

export const metadata: Metadata = {
  title: page.seo.title,
  description: page.seo.description,
  alternates: { canonical: "/research" },
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
      <PageHeader {...page.header} />

      <section className="py-20 sm:py-24">
        <Container>
          <GroupHeading
            title={page.published.title}
            count={published.length}
            note={page.published.note}
          />
          <div className="mt-8 border-t border-border">
            {published.map((pub, i) => (
              <PublicationCard key={pub.id} pub={pub} delay={Math.min(i * 0.05, 0.2)} />
            ))}
          </div>

          <div className="mt-20">
            <GroupHeading
              title={page.ongoing.title}
              count={ongoing.length}
              note={page.ongoing.note}
            />
            <div className="mt-8 border-t border-border">
              {ongoing.map((pub, i) => (
                <PublicationCard key={pub.id} pub={pub} delay={Math.min(i * 0.05, 0.2)} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner title={page.cta.title} description={page.cta.description} />
    </>
  );
}
