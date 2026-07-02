import { ArrowRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/data";
import { Container } from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import { Reveal } from "./ui/Reveal";

export function CtaBanner({
  title = "Let's talk about EEG, BCI, or a research collaboration.",
  description = "Reviewing one of my graduate applications, or just curious about phenotype-aware EEG models? I'd love to hear from you.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="border-t border-border py-24 sm:py-32">
      <Container>
        <Reveal className="relative py-14 text-center">
          {/* Fine hairline across the top, with a light that glides along it */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent"
            aria-hidden="true"
          />
          <div
            className="hairline-shimmer pointer-events-none absolute inset-x-0 top-0 h-px motion-reduce:hidden"
            aria-hidden="true"
          />
          {/* Distant ambient glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-56 w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[90px]"
            style={{ background: "radial-gradient(circle, rgba(56,189,248,0.45) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="font-display text-balance text-2xl font-normal text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-relaxed text-foreground-muted sm:text-base">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/contact" icon={<ArrowRight size={16} weight="bold" />}>
                Get in touch
              </ButtonLink>
              <ButtonLink
                href={profile.cvPath}
                external
                variant="secondary"
                icon={<DownloadSimple size={16} weight="bold" />}
              >
                Download CV
              </ButtonLink>
            </div>
          </div>
          {/* Fine hairline across the bottom */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
            aria-hidden="true"
          />
        </Reveal>
      </Container>
    </section>
  );
}
