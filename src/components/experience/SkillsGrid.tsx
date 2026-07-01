import { skills } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function SkillsGrid() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Toolkit" title="Technical skills" />

        <Reveal className="mt-10 divide-y divide-border border-b border-border">
          {skills.map((group) => (
              <div key={group.category} className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[14rem_1fr] sm:gap-8 sm:py-7">
                <h3 className="pt-0.5 text-xs font-medium uppercase tracking-wider text-foreground-faint">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-background-elevated px-2.5 py-1 text-xs font-medium text-foreground-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
