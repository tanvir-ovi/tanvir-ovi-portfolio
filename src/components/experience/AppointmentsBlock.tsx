import { researchAppointments } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function AppointmentsBlock() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Research appointments"
          title="Where the current work is done"
        />

        <Reveal className="mt-10 divide-y divide-border border-t border-border">
          {researchAppointments.map((post) => (
            <article key={post.id} className="py-8 sm:py-10">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {post.role}, {post.lab}
                </h3>
                <span className="font-display text-sm italic text-foreground-faint">
                  {post.period}
                </span>
              </div>

              {/* Affiliation line - department, institution, and how it is worked */}
              <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-foreground-muted">
                <span>{post.department}</span>
                <span className="h-3 w-px bg-border-strong" aria-hidden="true" />
                <span>{post.institution}</span>
                <span className="rounded-full border border-accent/25 bg-accent-soft px-2.5 py-0.5 text-xs text-accent-strong">
                  {post.mode}
                </span>
              </p>

              <ul className="mt-5 space-y-2.5">
                {post.bullets.map((bullet) => (
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
            </article>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
