"use client";

import { useEffect, useRef, useState } from "react";
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

  // Desktop and mobile get different hero compositions (full-bleed glide vs a
  // dedicated framed panel), so we mount only the one that matches the viewport.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
      // On mobile the brain plays a centred intro first, so the copy reveals
      // later - as the brain settles into the lower half. Desktop reveals early.
      const onMobile = !window.matchMedia("(min-width: 1024px)").matches;
      const startDelay = onMobile ? 2.5 : 0.65;
      // Hide immediately so nothing flashes during the delay / mobile intro
      gsap.set("[data-hero-line]", { yPercent: 118 });
      gsap.set(
        ["[data-hero-overline]", "[data-hero-para]", "[data-hero-cta]", "[data-hero-meta]"],
        { opacity: 0 }
      );
      gsap
        .timeline({ delay: startDelay, defaults: { ease: "power3.out" } })
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

      {/* The neural brain owns the hero canvas. Desktop glides it to the right
          column; mobile plays a staged intro (centred zoom, then it settles into
          the lower half as the copy reveals above it). Mounted once we know the
          viewport so each gets the right choreography. */}
      {!prefersReducedMotion && isDesktop !== null ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <NeuralBrain pointer={pointer} variant={isDesktop ? "desktop" : "mobile"} />
        </div>
      ) : null}

      {/* Mobile scrim: darkens the upper area so the revealed copy reads clearly
          over the brain that settles below it. */}
      {!prefersReducedMotion ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background from-[12%] via-background/70 via-[52%] to-transparent lg:hidden"
          aria-hidden="true"
        />
      ) : null}

      {/* Smooth transition so the scene melts into the next section instead of
          ending on a hard seam. Matches the stats section background. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-[var(--background-elevated)]"
        aria-hidden="true"
      />

      <Container className="relative flex min-h-[100svh] flex-col justify-start py-24 sm:py-28 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:items-center lg:gap-10 lg:py-16">

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

        {/* Reduced-motion mobile fallback: the calm EEG field below the copy */}
        {prefersReducedMotion ? (
          <div className="relative order-2 mt-6 h-[46svh] w-full lg:hidden" aria-hidden="true">
            <EEGSignalField />
          </div>
        ) : null}

        {/* Desktop right column: spacer the brain occupies; static EEG field
            when the visitor prefers reduced motion */}
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
