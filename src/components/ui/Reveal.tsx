"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* Premium reveal: elements rise and resolve from a soft blur instead of a
 * flat fade, on a long ease-out curve. One reveal per section keeps the
 * motion editorial rather than busy.
 *
 * Implemented with a plain IntersectionObserver + CSS transition (not a JS
 * animation lib) so server and client render identical markup — no hydration
 * mismatch — and reduced-motion visitors always see content immediately (the
 * CSS media query forces the resolved state). */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "ul";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "-10% 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("reveal-blur", shown && "reveal-blur-in", className)}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
