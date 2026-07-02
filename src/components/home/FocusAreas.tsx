import { focusAreas } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function FocusAreas() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Research focus"
          title="Four questions about the signals we carry"
          description="My work sits at the intersection of signal processing and deep learning. I'm mostly asking what EEG can tell us about the mind, and where it quietly stops being able to."
        />

        {/* One section-level reveal; individual rows do not animate in */}
        <Reveal className="mt-14 border-t border-border">
          {focusAreas.map((area, i) => (
            /* group: hover shifts index colour and extends a fine accent line along the bottom */
            <div
              key={area.title}
              className="group relative grid grid-cols-[2.5rem_1fr] items-baseline gap-x-5 border-b border-border py-8 sm:grid-cols-[3.5rem_1fr] sm:gap-x-8 sm:py-10"
            >
              {/* Hover signal line - extends left-to-right along the bottom border */}
              <span
                className="absolute bottom-0 left-0 h-px w-0 bg-accent/30 transition-[width] duration-500 ease-in-out group-hover:w-full"
                aria-hidden="true"
              />

              {/* Index numeral */}
              <span className="font-display text-2xl italic text-foreground-faint transition-colors duration-300 group-hover:text-accent sm:text-3xl">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:group-hover:translate-x-0">
                <h3 className="text-base font-semibold text-foreground sm:text-lg">
                  {area.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted sm:text-base">
                  {area.description}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
