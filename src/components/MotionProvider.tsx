"use client";

import { useEffect } from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";
import Lenis from "lenis";

/* Lenis gives the whole site inertial, eased scrolling - the single biggest
 * "expensive site" tell. It drives the native scrollbar (no transform hacks),
 * and is skipped entirely when the visitor prefers reduced motion. */
function SmoothScroll() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 1 });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return null;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      {children}
    </MotionConfig>
  );
}
