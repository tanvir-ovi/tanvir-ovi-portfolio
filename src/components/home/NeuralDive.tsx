"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/data";
import { afterHeroAssets } from "@/lib/load-order";

/* Scroll-scrubbed fly-through: the camera pushes from outside the brain into
 * its neural network as the visitor scrolls, while four short beats describe
 * the research pipeline. The section is tall and its stage is sticky, so the
 * scroll distance becomes the video's timeline.
 *
 * The whole clip is downloaded into memory once the page is idle, then played
 * from a blob URL. Streaming it instead meant every seek waited on the network,
 * so the scene sat frozen on one frame until the file had fully arrived. Until
 * the clip is ready, the poster (its first frame) zooms with scroll, so the
 * scene always moves; the video then fades in over it.
 *
 * Only one seek may be in flight at once, so slower devices finish decoding
 * instead of restarting. Reduced-motion visitors get the four beats as an
 * ordinary static list. */

const { heading, beats } = site.home.insideTheWork;

export function NeuralDive() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [reduce, setReduce] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    const id = requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => { cancelAnimationFrame(id); mq.removeEventListener("change", update); };
  }, []);

  // Fetch the whole clip (sized by viewport) once the page and the hero brain
  // have loaded, or straight away if the visitor is already heading for the section.
  // Data-saver visitors keep the zooming poster and skip the download.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduce || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const url = window.matchMedia("(min-width: 768px)").matches
      ? "/video/neural-dive.mp4"
      : "/video/neural-dive-sm.mp4";
    const controller = new AbortController();
    let objectUrl: string | null = null;
    let started = false;
    let idleId = 0;
    let timer = 0;
    let io: IntersectionObserver | null = null;

    const start = () => {
      if (started) return;
      started = true;
      io?.disconnect();
      fetch(url, { signal: controller.signal })
        .then((r) => {
          if (!r.ok) throw new Error("Clip unavailable");
          return r.blob();
        })
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        })
        .catch(() => {
          // Network trouble: fall back to streaming, which still beats a still frame
          if (!controller.signal.aborted) setSrc(url);
        });
    };

    // The section starts about a screen below the hero, so a wide margin would
    // fire on load; this fires once the visitor actually scrolls toward it.
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      },
      { rootMargin: "0px 0px 15% 0px" }
    );
    io.observe(el);

    // After page load, let the hero brain's mesh finish first (at most 8 s), so
    // the two downloads don't split a slow connection, then start when idle.
    let cancelWait = () => {};
    let fallback = 0;
    const startWhenIdle = () => {
      cancelWait();
      window.clearTimeout(fallback);
      if (started || timer) return;
      timer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(start, { timeout: 2000 });
        else start();
      }, 300);
    };
    const onLoad = () => {
      cancelWait = afterHeroAssets(startWhenIdle);
      fallback = window.setTimeout(startWhenIdle, 8000);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      controller.abort();
      io?.disconnect();
      window.removeEventListener("load", onLoad);
      cancelWait();
      window.clearTimeout(fallback);
      window.clearTimeout(timer);
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    const poster = posterRef.current;
    if (!section || !video) return;

    // iOS only allows seeking after a play() call has been made once
    const unlock = () => {
      video.play().then(() => video.pause()).catch(() => {});
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    let current = -1;
    let raf = 0;
    let running = false;
    let near = false;
    let lastTime = 0;

    // Geometry is measured on resize, not per frame: reading layout inside
    // the loop forced a synchronous reflow on every animation frame.
    let top = 0;
    let span = 1;
    const measure = () => {
      const rect = section.getBoundingClientRect();
      top = rect.top + window.scrollY;
      span = rect.height - window.innerHeight;
      wake();
    };

    const tick = (now: number) => {
      const p = span > 0 ? Math.min(Math.max((window.scrollY - top) / span, 0), 1) : 0;
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = now;
      current = current < 0 ? p : current + (p - current) * (1 - Math.exp(-14 * dt));
      if (Math.abs(p - current) < 0.0005) current = p;

      let seekPending = false;
      if (video.readyState >= 2 && Number.isFinite(video.duration)) {
        const t = current * (video.duration - 0.05);
        if (Math.abs(video.currentTime - t) > 1 / 30) {
          seekPending = true;
          if (!video.seeking) video.currentTime = t;
        }
      }

      // Per-frame visuals are written straight to the DOM, not through React state.
      // The poster's stronger zoom stands in for the camera push until the clip is in.
      video.style.transform = `scale(${1 + current * 0.06})`;
      if (poster) poster.style.transform = `scale(${1 + current * 0.7})`;
      railRefs.current.forEach((el, i) => {
        if (el) el.style.width = `${Math.min(Math.max(current * beats.length - i, 0), 1) * 100}%`;
      });
      const nextActive = Math.min(beats.length - 1, Math.floor(current * beats.length * 0.999));
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }

      // Sleep once the easing has settled and the frame is decoded; scroll,
      // resize and video events wake the loop again.
      if (near && (current !== p || seekPending)) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        lastTime = 0;
      }
    };

    function wake() {
      if (!near || running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    // The scrub loop only runs while the tall scene is near the viewport. This
    // keeps the rest of the portfolio idle instead of paying for a permanent RAF.
    const observer = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (near) measure();
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    observer.observe(section);
    // Content above (fonts, images) can move the section without resizing it
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", measure);
    // Reveal the clip once it has a decoded frame to show
    const onLoaded = () => {
      if (src && video.readyState >= 2) setVideoReady(true);
      wake();
    };
    video.addEventListener("seeked", wake);
    video.addEventListener("loadeddata", onLoaded);
    if (src && video.readyState >= 2) onLoaded();

    return () => {
      near = false;
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", measure);
      video.removeEventListener("seeked", wake);
      video.removeEventListener("loadeddata", onLoaded);
      window.removeEventListener("touchstart", unlock);
    };
  }, [reduce, src]);

  if (reduce) {
    return (
      <section id="inside-the-work" className="border-t border-border py-24" aria-label="Research pipeline, from raw signal to understanding">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          <h2 className="eyebrow-mono mb-8">{heading}</h2>
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
        {/* First frame of the clip; zooms with scroll until the video is ready.
            A plain img: the file is already a small WebP and the scrub loop
            writes its transform directly, which next/image's wrapper would get in the way of. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={posterRef}
          src="/video/neural-dive-poster.webp"
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ filter: "saturate(0.95) brightness(0.78)" }}
          aria-hidden="true"
        />
        <video
          ref={videoRef}
          src={src ?? undefined}
          muted
          playsInline
          preload="auto"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
            videoReady ? "opacity-100" : "opacity-0"
          )}
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
            <h2 className="eyebrow-mono mb-6 flex items-center gap-2.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {heading}
            </h2>

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
