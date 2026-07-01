import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { referees } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function References() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Academic references"
          title="People who have supervised this work"
        />

        {/* Editorial divided list - two referees, no card boxes */}
        <Reveal className="mt-10 divide-y divide-border border-y border-border">
          {referees.map((ref) => (
              <div key={ref.name} className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-12">
                <div>
                  <p className="text-sm font-semibold text-foreground">{ref.name}</p>
                  <p className="mt-1.5 max-w-md text-xs leading-relaxed text-foreground-muted">
                    {ref.title}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-muted">{ref.institution}</p>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <p className="text-xs font-medium uppercase tracking-wide text-accent-strong">
                    {ref.relation}
                  </p>
                  <a
                    href={`mailto:${ref.email}`}
                    className="flex items-center gap-1.5 text-xs text-foreground-muted transition-colors duration-200 hover:text-accent-strong"
                  >
                    <EnvelopeSimple size={13} />
                    {ref.email}
                  </a>
                </div>
              </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
