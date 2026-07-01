import { honors, standardisedTests } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function HonorsAndTests() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <Container>
        <div className="grid gap-16 lg:grid-cols-5">

          {/* Honours - editorial divided list, no cards */}
          <div className="lg:col-span-3">
            <SectionHeading eyebrow="Recognition" title="Honors & awards" className="mb-0" />
            <Reveal as="ul" className="mt-10 divide-y divide-border border-b border-border border-t border-t-border">
              {honors.map((honor) => (
                <li key={honor.title}>
                  <div className="flex items-start gap-4 py-6">
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/65"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{honor.title}</p>
                      <p className="mt-0.5 text-sm text-foreground-muted">{honor.venue}</p>
                      <p className="mt-0.5 text-xs text-foreground-faint">{honor.date}</p>
                    </div>
                  </div>
                </li>
              ))}
            </Reveal>
          </div>

          {/* Standardised tests - retain structured layout but drop card border/bg */}
          <div className="lg:col-span-2">
            <SectionHeading eyebrow="Language" title="Standardised tests" className="mb-0" />
            <Reveal className="mt-10 divide-y divide-border border-b border-border border-t border-t-border">
              {standardisedTests.map((test) => (
                  <div key={test.name} className="py-7">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{test.name}</h3>
                      <span className="font-display text-xs italic text-foreground-faint">
                        {test.date}
                      </span>
                    </div>
                    <p className="mt-2 font-display text-3xl font-normal tabular-nums text-foreground">
                      {test.overall}
                      <span className="ml-1.5 text-sm font-sans font-normal text-foreground-faint">
                        overall band
                      </span>
                    </p>
                    <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-4">
                      {test.breakdown.map((b) => (
                        <div key={b.label}>
                          <dt className="text-[10px] font-medium uppercase tracking-wide text-foreground-faint">
                            {b.label}
                          </dt>
                          <dd className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                            {b.score}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
              ))}
            </Reveal>
          </div>

        </div>
      </Container>
    </section>
  );
}
