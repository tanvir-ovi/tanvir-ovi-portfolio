import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { publications } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { StatusBadge } from "../ui/Badge";
import { ButtonLink } from "../ui/Button";

export function FeaturedPublications() {
  const featured = publications.filter((p) => p.featured);

  return (
    <section className="border-t border-border py-24 sm:py-32">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Selected publications"
            title="Peer-reviewed work on EEG, cognition, and identity"
            className="mb-0"
          />
          <Reveal>
            <ButtonLink href="/research" variant="ghost" icon={<ArrowRight size={16} />}>
              All 8 publications
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal className="mt-12 divide-y divide-border border-y border-border">
          {featured.map((pub) => (
              <Link
                key={pub.id}
                href={`/research#${pub.id}`}
                className="group flex flex-col gap-3 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={pub.status} />
                    {pub.firstAuthor ? (
                      <span className="text-xs font-medium uppercase tracking-wide text-accent-strong">
                        First author
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-balance text-base font-medium text-foreground transition-colors duration-300 group-hover:text-accent-strong sm:text-lg">
                    {pub.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-foreground-muted">
                    {pub.venue} · {pub.year}
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  className="hidden shrink-0 text-foreground-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent-strong sm:block"
                />
              </Link>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
