"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/data";
import { Container } from "../ui/Container";
import { ButtonLink } from "../ui/Button";
import { EEGSignalField } from "./EEGSignalField";

/* The 3D neural brain is client-only and code-split so the first paint of
 * the headline never waits on three.js. */
const NeuralBrain = dynamic(
  () => import("./NeuralBrain").then((m) => m.NeuralBrain),
  { ssr: false }
);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Normalised cursor position consumed by the 3D scene for its gentle tilt
  const pointer = useRef({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    pointer.current.x = (e.clientX - rect.left) / rect.width - 0.5;
    pointer.current.y = (e.clientY - rect.top) / rect.height - 0.5;
  }

  function handleMouseLeave() {
    pointer.current.x = 0;
    pointer.current.y = 0;
  }

  // Text entrance: masked line reveal for the headline, blur-to-sharp for the
  // supporting copy. Timed so the lines land while the brain glides right.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({ delay: 0.65, defaults: { ease: "power3.out" } })
        .fromTo(
          "[data-hero-overline]",
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.7 }
        )
        .fromTo(
          "[data-hero-line]",
          { yPercent: 118 },
          { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.14 },
          0.15
        )
        .fromTo(
          "[data-hero-para]",
          { opacity: 0, y: 18, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 },
          0.62
        )
        .fromTo(
          "[data-hero-cta]",
          { opacity: 0, y: 14, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          0.80
        )
        .fromTo(
          "[data-hero-meta]",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.94
        );
    },
    { scope: textRef }
  );

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-grain relative overflow-hidden"
    >
      {/* Distant radial atmosphere - keeps the navy from feeling flat */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 80% at 84% 16%, rgba(56,189,248,0.07) 0%, rgba(2,6,23,0) 58%)",
        }}
        aria-hidden="true"
      />

      {/* The neural brain owns the whole hero canvas on every device. On desktop
          it glides to the right column; on mobile it stays centred behind the
          copy (with a readability scrim below). Reduced motion gets the calm
          EEG field instead. */}
      {!prefersReducedMotion ? (
        <>
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <NeuralBrain pointer={pointer} />
          </div>
          {/* Mobile-only scrim: keeps the upper copy on solid dark, lets the
              brain glow through the lower half where it sits */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background from-30% via-background/60 to-transparent lg:hidden"
            aria-hidden="true"
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] opacity-[0.55] [mask-image:linear-gradient(to_bottom,transparent,black_22%)] lg:hidden"
          aria-hidden="true"
        >
          <EEGSignalField />
        </div>
      )}

      {/* Smooth transition so the 3D scene melts into the next section instead
          of ending on a hard seam. Matches the stats section background. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-[var(--background-elevated)]"
        aria-hidden="true"
      />

      <Container className="relative grid min-h-[100svh] grid-cols-1 items-start gap-10 py-24 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:items-center lg:gap-10 lg:py-16">

        {/* Copy - first in the DOM so it sits at the top of the mobile viewport */}
        <div ref={textRef} className="relative z-10 order-1 max-w-xl">
          {/* Signal-dot overline - quietly names the field, ties to the EEG theme */}
          <div
            data-hero-overline
            className="mb-6 flex items-center gap-2.5 text-[0.78rem] font-medium tracking-wide text-foreground-faint"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent/70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-strong" />
            </span>
            EEG · Brain-Computer Interfaces · Deep Learning
          </div>

          {/* Masked line reveal: each line rises out of its own overflow clip */}
          <h1 className="font-display font-normal leading-[1.03] tracking-tight text-[3rem] sm:text-[3.8rem] lg:text-[4.4rem]">
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-hero-line className="block text-[#e6edfb]">
                Turning brainwaves
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <span data-hero-line className="block text-[#e6edfb]">
                into <span className="italic text-accent-strong">understanding</span>.
              </span>
            </span>
          </h1>

          <p
            data-hero-para
            className="mt-6 max-w-[42ch] text-base leading-relaxed text-foreground-muted sm:text-[1.075rem]"
          >
            I&apos;m {profile.name}, an EEG and brain-computer interface researcher. I build
            deep-learning systems that decode cognition, emotion, and identity from brain
            signals, and I study how immersion reshapes the way we think.
          </p>

          <div data-hero-cta className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/research" icon={<ArrowRight size={16} weight="bold" />}>
              View research
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

          {/* Grounding meta line - location + availability, the way researchers do */}
          <div
            data-hero-meta
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-faint"
          >
            <span>{profile.location}</span>
            <span className="h-3 w-px bg-border-strong" aria-hidden="true" />
            <span>Open to PhD &amp; research-master positions</span>
          </div>
        </div>

        {/* Right column: spacer the brain occupies; static EEG field when the
            visitor prefers reduced motion */}
        <div
          className="relative order-2 hidden h-[72svh] max-h-[620px] w-full lg:block"
          aria-hidden="true"
        >
          {prefersReducedMotion ? <EEGSignalField /> : null}
        </div>
      </Container>
    </section>
  );
}
