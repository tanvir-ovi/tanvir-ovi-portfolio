"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  const [brainReady, setBrainReady] = useState(false);
  const markBrainReady = useCallback(() => setBrainReady(true), []);
  // Release the copy even if the model or GPU is unavailable on a slow device.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const timeout = window.setTimeout(markBrainReady, 5000);
    return () => window.clearTimeout(timeout);
  }, [markBrainReady]);

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

  // Phones keep the brain mostly below the fold, so three.js waits for the
  // first scroll or touch (or a quiet moment) and never delays the first tap.
  const [mobileBrain, setMobileBrain] = useState(false);
  useEffect(() => {
    if (isDesktop !== false) return;
    const events = ["scroll", "touchstart", "pointerdown", "keydown"] as const;
    let idleId = 0;
    let timer = 0;
    const stop = () => {
      events.forEach((e) => window.removeEventListener(e, start));
      window.clearTimeout(timer);
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
    };
    function start() {
      stop();
      setMobileBrain(true);
    }
    events.forEach((e) => window.addEventListener(e, start, { passive: true }));
    timer = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(start, { timeout: 1500 });
      else start();
    }, 3500);
    return stop;
  }, [isDesktop]);

  // Only apply the reduced-motion branch after mount so server and first client
  // render match (framer's useReducedMotion differs across that boundary).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const reduce = mounted && prefersReducedMotion;

  // Scroll-out: as the hero leaves, the brain swells and dims while the copy
  // lifts away, so the page hands off to the next section instead of cutting.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const brainScale = useTransform(scrollYProgress, [0, 1], [1, 1.22]);
  const brainOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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

  // Text entrance (masked line reveal, blur-to-sharp copy) is pure CSS in
  // globals.css, so it starts with the first paint instead of after hydration.
  // On desktop it holds until the brain is ready (data-brain-ready).
  return (
    <section
      ref={sectionRef}
      data-brain-ready={brainReady}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hero-intro relative overflow-hidden"
    >
      {/* Dual aurora atmosphere - cyan signal top-right, violet depth bottom-left */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 75% at 84% 12%, rgba(56,189,248,0.10) 0%, rgba(3,6,15,0) 56%), radial-gradient(95% 70% at 4% 102%, rgba(139,125,255,0.11) 0%, rgba(3,6,15,0) 60%)",
        }}
        aria-hidden="true"
      />

      {/* Fade the reading-column scrim in only as the brain leaves the centre. */}
      <div
        data-hero-desktop-scrim
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[60%] bg-gradient-to-r from-background via-background/85 to-transparent lg:block"
        aria-hidden="true"
      />

      {/* Desktop gives the brain a full-bleed canvas with a rightward glide. */}
      {!reduce && isDesktop === true ? (
        <motion.div
          style={{ scale: brainScale, opacity: brainOpacity }}
          className="pointer-events-none absolute inset-0 motion-reduce:hidden"
          aria-hidden="true"
        >
          <NeuralBrain pointer={pointer} variant="desktop" onReady={markBrainReady} />
        </motion.div>
      ) : null}

      {/* Smooth transition so the scene melts into the next section instead of
          ending on a hard seam. Matches the stats section background. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-[var(--background-elevated)]"
        aria-hidden="true"
      />

      <Container className="relative flex min-h-[100svh] flex-col justify-start pb-12 pt-16 sm:pt-20 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] lg:items-center lg:gap-10 lg:py-16">

        {/* Copy - first in the DOM so it sits at the top of the mobile viewport */}
        <motion.div
          ref={textRef}
          style={reduce || !isDesktop ? undefined : { y: copyY, opacity: copyOpacity }}
          className="relative z-10 order-1 max-w-xl"
        >
          {/* Mobile-only backdrop: keeps the copy on solid dark over the brain,
              then fades into the brain zone below. Fades in with the text so the
              centred intro stays clean. */}
          <div
            data-hero-scrim
            className="pointer-events-none absolute -inset-x-8 -top-28 -bottom-12 -z-10 bg-gradient-to-b from-background from-70% via-background/95 via-[86%] to-transparent lg:hidden"
            aria-hidden="true"
          />
          {/* Signal-dot overline - a mono lab-readout that names the field */}
          <div
            data-hero-overline
            className="eyebrow-mono mb-6 flex items-center gap-2.5"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent/70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-strong" />
            </span>
            EEG · Brain-Computer Interfaces · Deep Learning
          </div>

          {/* Masked line reveal: each line rises out of its own overflow clip */}
          {/* Desktop size tracks the copy column so each line stays whole */}
          <h1 className="font-display font-normal leading-[1.03] tracking-tight text-[clamp(2.5rem,12.3vw,3rem)] sm:text-[3.8rem] lg:w-max lg:text-[clamp(3.5rem,calc(5.8vw-0.2rem),4rem)]">
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-hero-line className="block text-[#e6edfb]">
                Turning brainwaves
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <span data-hero-line style={{ "--i": 1 } as React.CSSProperties} className="block text-[#e6edfb]">
                into <span className="italic text-aurora">understanding</span>.
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
        </motion.div>

        {/* A separate mobile stage keeps the neural brain clear of the copy.
            It mounts once the browser is idle so phones paint and hydrate the
            copy before three.js starts compiling. */}
        {!reduce && isDesktop === false ? (
          <div className="relative order-2 mt-8 h-[85vw] max-h-[420px] w-full lg:hidden" aria-hidden="true">
            {mobileBrain ? <NeuralBrain pointer={pointer} variant="mobile" /> : null}
          </div>
        ) : null}

        {/* Reduced-motion mobile fallback: the calm EEG field below the copy */}
        {reduce ? (
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
          {reduce ? <EEGSignalField /> : null}
        </div>
      </Container>

      {!reduce ? (
        <motion.div
          style={{ opacity: copyOpacity }}
          className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-faint sm:flex"
          aria-hidden="true"
        >
          <span>Scroll to enter the signal</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/10">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_1.8s_ease-in-out_infinite] bg-accent" />
          </span>
        </motion.div>
      ) : null}
    </section>
  );
}
