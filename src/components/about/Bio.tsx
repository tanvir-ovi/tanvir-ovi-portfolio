import Image from "next/image";
import { site } from "@/lib/data";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

const { bio: paragraphs, portrait, thesis } = site.about;

export function Bio() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* One section-level reveal for the whole narrative - no per-paragraph animation */}
          <Reveal className="order-2 space-y-5 lg:order-1">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-balance text-base leading-relaxed text-foreground-muted">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={0.05}>
            <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-3xl border border-border-strong bg-surface">
              <div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
                style={{
                  background:
                    "radial-gradient(120% 80% at 50% 0%, rgba(56,189,248,0.22), transparent 60%)",
                }}
                aria-hidden="true"
              />
              <Image
                src={portrait.src}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                priority
                quality={92}
                sizes="(min-width: 1024px) 22rem, 80vw"
                className="aspect-[4/5] w-full object-cover object-top"
                style={portrait.focus ? { objectPosition: portrait.focus } : undefined}
              />
            </div>
          </Reveal>
        </div>

        {/* Thesis band - the bound undergraduate EEG thesis that started the work */}
        {thesis.visible ? (
          <Reveal className="mt-16 grid gap-10 border-t border-border pt-14 sm:grid-cols-[18rem_1fr] sm:items-center sm:gap-12">
            <figure className="relative mx-auto w-full max-w-[18rem] overflow-hidden rounded-2xl border border-border-strong bg-surface">
              <Image
                src={thesis.image.src}
                alt={thesis.image.alt}
                width={thesis.image.width}
                height={thesis.image.height}
                quality={92}
                sizes="(min-width: 640px) 18rem, 80vw"
                className="aspect-[4/5] w-full object-cover object-top"
                style={thesis.image.focus ? { objectPosition: thesis.image.focus } : undefined}
              />
            </figure>
            <div>
              <p className="font-display text-2xl italic leading-snug text-foreground sm:text-[2rem]">
                &ldquo;{thesis.quote}&rdquo;
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-muted">
                {thesis.body}
              </p>
            </div>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
