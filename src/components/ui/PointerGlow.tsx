"use client";

import { useEffect, useRef } from "react";

/* A soft light that follows the pointer across its parent card. Drop it in as
 * a child of a `relative overflow-hidden` element. It writes two CSS variables
 * on pointer move (no React re-render) and is skipped on touch screens. */
export function PointerGlow({ color = "rgba(56,189,248,0.16)" }: { color?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const glow = ref.current;
    const host = glow?.parentElement;
    if (!glow || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = host.getBoundingClientRect();
        glow.style.setProperty("--gx", `${e.clientX - r.left}px`);
        glow.style.setProperty("--gy", `${e.clientY - r.top}px`);
      });
    };
    host.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-glow"
      style={{ "--glow-color": color } as React.CSSProperties}
    />
  );
}
