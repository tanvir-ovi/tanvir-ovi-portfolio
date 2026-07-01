import { researchExperience } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function ExperienceTimeline() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Research experience"
          title="Three studies, one question: what does cross-session EEG actually carry?"
        />

        <div className="relative mt-12">
          {/* Vertical timeline track - desktop only */}
          <div
            className="absolute left-[7px] top-2 bottom-2 hidden w-px bg-border sm:block"
            aria-hidden="true"
          />

          <Reveal className="space-y-0 divide-y divide-border border-b border-border">
            {researchExperience.map((item) => (
              <div key={item.id} className="relative sm:pl-10">
                {/* Timeline dot */}
                <span
                  className="absolute left-0 top-8 hidden h-[15px] w-[15px] rounded-full border-2 border-accent bg-background sm:block"
                  aria-hidden="true"
                />

                <div className="py-8 sm:py-10">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-base font-semibold text-foreground sm:text-lg">
                      {item.title}
                    </h3>
                    <span className="font-display text-sm italic text-foreground-faint">
                      {item.period}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2.5">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-sm leading-relaxed text-foreground-muted"
                      >
                        <span
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/60"
                          aria-hidden="true"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
