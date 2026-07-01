import { education } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function EducationBlock() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Education"
          title="Bachelor of Science, Electrical & Electronic Engineering"
        />

        <Reveal delay={0.1}>
          <div className="mt-10 border-t border-border pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-lg font-semibold text-foreground">{education.institution}</h3>
              <span className="font-display text-sm italic text-foreground-faint">
                {education.period}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground-muted">{education.degree}</p>

            <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-7 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-foreground-faint">
                  CGPA
                </dt>
                <dd className="mt-1.5 font-display text-3xl font-normal tabular-nums text-foreground">
                  {education.cgpa}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-foreground-faint">
                  Merit position
                </dt>
                <dd className="mt-1.5 font-display text-3xl font-normal text-foreground">
                  {education.merit}
                </dd>
              </div>
            </dl>

            <div className="mt-7 border-t border-border pt-7">
              <dt className="text-xs font-medium uppercase tracking-wider text-foreground-faint">
                Graduation thesis
              </dt>
              <dd className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted">
                {education.thesis}
              </dd>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
