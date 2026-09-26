"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* Scroll-scrubbed fly-through: the camera pushes from outside the brain into
 * its neural network as the visitor scrolls, while four short beats describe
 * the research pipeline. The section is tall and its stage is sticky, so the
 * scroll distance becomes the video's timeline.
 *
 * Frequent keyframes support forward/backward seeking. Only one seek may be
 * in flight at once, so slower devices finish decoding instead of restarting.
 * Reduced-motion visitors get the four beats as an ordinary static list. */

const beats = [
  {
    kicker: "01 · Signal",
    title: "Faint, noisy, and different in every person.",
    body: "Scalp EEG is a few microvolts of brain activity buried under eye blinks, muscle, and line noise. Every head reads it a little differently.",
  },
  {
    kicker: "02 · Clean",
    title: "Keep the evaluation honest.",
    body: "ICA artifact removal, band filtering, and splits made at the recording level, so no window from a test recording ever leaks into training.",
  },
  {
    kicker: "03 · Decode",
    title: "Read cognition, emotion, and identity.",
    body: "From EEGNet variants to cross-attention networks that pair raw signals with engineered features.",
  },
  {
    kicker: "04 · Understand",
    title: "Ask why the model works.",
    body: "Which frequency band, which person, which session. Statistics that explain the result, not just score it.",
  },
];

export function NeuralDive() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [reduce, setReduce] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    const id = requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => { cancelAnimationFrame(id); mq.removeEventListener("change", update); };
  }, []);

  // Only fetch the clip once the section is near, and pick the size by viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduce || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSrc(
            window.matchMedia("(min-width: 768px)").matches
              ? "/video/neural-dive.mp4"
              : "/video/neural-dive-sm.mp4"
          );
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px 150% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // iOS only allows seeking after a play() call has been made once
    const unlock = () => {
      video.play().then(() => video.pause()).catch(() => {});
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    let current = 0;
    let raf = 0;
    let running = false;
    let lastTime = 0;

    const tick = (now: number) => {
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = now;
      current += (p - current) * (1 - Math.exp(-14 * dt));
      if (Math.abs(p - current) < 0.0005) current = p;

      if (video.readyState >= 2 && Number.isFinite(video.duration) && !video.seeking) {
        const t = current * (video.duration - 0.05);
        if (Math.abs(video.currentTime - t) > 1 / 30) video.currentTime = t;
      }

      // Per-frame visuals are written straight to the DOM, not through React state
      video.style.transform = `scale(${1 + current * 0.06})`;
      railRefs.current.forEach((el, i) => {
        if (el) el.style.width = `${Math.min(Math.max(current * beats.length - i, 0), 1) * 100}%`;
      });
      const nextActive = Math.min(beats.length - 1, Math.floor(current * beats.length * 0.999));
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
      if (running) raf = requestAnimationFrame(tick);
    };

    // The scrub loop only runs while the tall scene is near the viewport. This
    // keeps the rest of the portfolio idle instead of paying for a permanent RAF.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    observer.observe(section);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("touchstart", unlock);
    };
  }, [reduce, src]);

  if (reduce) {
    return (
      <section id="inside-the-work" className="border-t border-border py-24" aria-label="Research pipeline, from raw signal to understanding">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          <p className="eyebrow-mono mb-8">Inside the work</p>
          <div className="grid gap-10 sm:grid-cols-2">
            {beats.map((b) => (
              <div key={b.kicker}>
                <p className="eyebrow-mono text-accent">{b.kicker}</p>
                <h3 className="mt-3 font-display text-2xl text-foreground">{b.title}</h3>
                <p className="mt-3 text-foreground-muted">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="inside-the-work"
      ref={sectionRef}
      className="relative h-[280svh] bg-background md:h-[300svh]"
      aria-label="Research pipeline, from raw signal to understanding"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <video
          ref={videoRef}
          src={src ?? undefined}
          poster="/video/neural-dive-poster.webp"
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "saturate(0.95) brightness(0.78)" }}
          aria-hidden="true"
        />

        {/* Edge vignette + left scrim keep the copy legible over the brightest frames */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 50%, rgba(3,6,15,0) 40%, rgba(3,6,15,0.85) 100%), linear-gradient(90deg, rgba(3,6,15,0.9) 0%, rgba(3,6,15,0.55) 38%, rgba(3,6,15,0) 62%)",
          }}
          aria-hidden="true"
        />
        {/* Phones put the copy over the brightest part of the frame */}
        <div className="pointer-events-none absolute inset-0 bg-[rgba(3,6,15,0.5)] sm:hidden" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />

        <div className="relative mx-auto flex h-full w-full max-w-6xl items-center px-6 sm:px-8">
          <div className="relative w-full max-w-md">
            <p className="eyebrow-mono mb-6 flex items-center gap-2.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Inside the work
            </p>

            {/* Beats stack in one grid cell and cross-fade as scroll advances */}
            <div className="grid">
              {beats.map((b, i) => (
                <div
                  key={b.kicker}
                  className={cn(
                    "col-start-1 row-start-1 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    i === active
                      ? "translate-y-0 opacity-100 blur-0"
                      : i < active
                        ? "-translate-y-6 opacity-0 blur-sm"
                        : "translate-y-6 opacity-0 blur-sm"
                  )}
                  aria-hidden={i !== active}
                >
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent-strong">{b.kicker}</p>
                  <h3 className="mt-4 font-display text-[2.2rem] leading-[1.08] tracking-tight text-foreground sm:text-5xl">
                    {b.title}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-foreground-muted sm:text-lg">{b.body}</p>
                </div>
              ))}
            </div>

            {/* Step rail */}
            <div className="mt-10 flex items-center gap-2" aria-hidden="true">
              {beats.map((b, i) => (
                <span key={b.kicker} className="relative h-[3px] w-12 overflow-hidden rounded-full bg-white/10">
                  <span
                    ref={(el) => {
                      railRefs.current[i] = el;
                    }}
                    className="absolute inset-y-0 left-0 w-0 rounded-full"
                    style={{ background: "var(--aurora)" }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
