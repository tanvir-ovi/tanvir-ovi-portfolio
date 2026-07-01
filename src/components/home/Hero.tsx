"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/data";
import { Container } from "../ui/Container";
import { ButtonLink } from "../ui/Button";
import { EEGSignalField } from "./EEGSignalField";

export function Hero() {
  const textRef      = useRef<HTMLDivElement>(null);
  const overlineRef  = useRef<HTMLDivElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const paraRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const metaRef      = useRef<HTMLDivElement>(null);

  // Text entrance: staggered power3.out - runs on mount, independent of any asset.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(overlineRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(headlineRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9 }, 0.12)
        .fromTo(paraRef.current,     { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.34)
        .fromTo(ctaRef.current,      { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.50)
        .fromTo(metaRef.current,     { opacity: 0, y: 8  }, { opacity: 1, y: 0, duration: 0.6 }, 0.62);
    },
    { scope: textRef }
  );

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Distant radial atmosphere - keeps the navy from feeling flat */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 80% at 84% 16%, rgba(56,189,248,0.07) 0%, rgba(2,6,23,0) 58%)",
        }}
        aria-hidden="true"
      />

      {/* MOBILE: EEG as a low-opacity decorative layer rising behind the lower copy.
          No large block above the headline. Hidden on desktop. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] opacity-[0.55] [mask-image:linear-gradient(to_bottom,transparent,black_22%)] lg:hidden"
        aria-hidden="true"
      >
        <EEGSignalField />
      </div>

      <Container className="relative grid grid-cols-1 items-center gap-10 py-24 sm:py-28 lg:min-h-[100svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:gap-10 lg:py-16">

        {/* Copy - first in the DOM so it sits at the top of the mobile viewport */}
        <div ref={textRef} className="relative z-10 order-1 max-w-xl">
          {/* Signal-dot overline - quietly names the field, ties to the EEG theme */}
          <div
            ref={overlineRef}
            className="mb-6 flex items-center gap-2.5 text-[0.78rem] font-medium tracking-wide text-foreground-faint"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent/70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-strong" />
            </span>
            EEG · Brain-Computer Interfaces · Deep Learning
          </div>

          <h1
            ref={headlineRef}
            className="font-display font-normal leading-[1.03] tracking-tight text-[3rem] sm:text-[3.8rem] lg:text-[4.4rem]"
          >
            <span className="block text-[#e6edfb]">Turning brainwaves</span>
            <span className="block text-[#e6edfb]">
              into <span className="italic text-accent-strong">understanding</span>.
            </span>
          </h1>

          <p
            ref={paraRef}
            className="mt-6 max-w-[42ch] text-base leading-relaxed text-foreground-muted sm:text-[1.075rem]"
          >
            I&apos;m {profile.name}, an EEG and brain-computer interface researcher. I build
            deep-learning systems that decode cognition, emotion, and identity from brain
            signals, and I study how immersion reshapes the way we think.
          </p>

          <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-3">
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
            ref={metaRef}
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-faint"
          >
            <span>{profile.location}</span>
            <span className="h-3 w-px bg-border-strong" aria-hidden="true" />
            <span>Open to PhD &amp; research-master positions</span>
          </div>
        </div>

        {/* DESKTOP: EEG signal field in the right column, hidden on mobile */}
        <div
          className="relative order-2 hidden h-[72svh] max-h-[620px] w-full lg:block"
          aria-hidden="true"
        >
          <EEGSignalField />
        </div>
      </Container>
    </section>
  );
}
