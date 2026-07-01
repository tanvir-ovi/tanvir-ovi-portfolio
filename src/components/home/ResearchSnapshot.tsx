"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { stats } from "@/lib/data";
import { Container } from "../ui/Container";

function CountStat({ label, value }: { label: string; value: string }) {
  const ref       = useRef<HTMLDivElement>(null);
  const isInView  = useInView(ref, { once: true, margin: "-15%" });
  const animated  = useRef(false);

  // Start with the final value so SSR renders correct content
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    if (!isInView || animated.current) return;
    animated.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Determine numeric target; slash values (e.g. "3.78/4.0") skip count-up below
    const slashIdx  = value.indexOf("/");
    const numStr    = slashIdx >= 0 ? value.slice(0, slashIdx) : value;
    const target    = parseFloat(numStr);
    const decimals  = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;

    // Stat with a slash (like CGPA) just flips in - no count-up
    if (slashIdx >= 0) return;

    const startTime = performance.now();
    const duration  = 1350;

    function frame(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplayed((eased * target).toFixed(decimals));
      if (progress < 1) requestAnimationFrame(frame);
      else setDisplayed(value);
    }

    requestAnimationFrame(frame);
  }, [isInView, value]);

  return (
    <div
      ref={ref}
      className="sm:border-l sm:border-border sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
    >
      <dt className="text-xs font-medium uppercase tracking-wider text-foreground-faint">
        {label}
      </dt>
      <dd className="mt-2 font-display text-3xl font-normal tabular-nums text-foreground sm:text-4xl">
        {displayed}
      </dd>
    </div>
  );
}

export function ResearchSnapshot() {
  return (
    <section className="border-b border-border bg-background-elevated">
      <Container>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-8 py-11 sm:grid-cols-4 sm:py-13">
          {stats.map((stat) => (
            <CountStat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </dl>
      </Container>
    </section>
  );
}
