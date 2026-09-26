"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* Two oversized rows of research vocabulary that slide in opposite directions
 * as the page scrolls past. Pure transform, so it costs almost nothing. */

const rowA = ["Electroencephalography", "Brain-Computer Interfaces", "Cognitive Load", "Emotion Recognition"];
const rowB = ["EEG Biometrics", "Imagined Speech", "Intracranial EEG", "Deep Learning"];

function Row({ words, from, to, outline }: { words: string[]; from: string; to: string; outline?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [from, to]);

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        style={reduce ? undefined : { x }}
        className="flex w-max items-center gap-8 whitespace-nowrap font-display text-[3.2rem] leading-none tracking-tight sm:gap-12 sm:text-[6.5rem]"
      >
        {[...words, ...words].map((w, i) => (
          <span key={`${w}-${i}`} className="flex items-center gap-8 sm:gap-12">
            <span
              className={outline ? "italic text-transparent" : "text-foreground/90"}
              style={outline ? { WebkitTextStroke: "1px rgba(125, 211, 252, 0.55)" } : undefined}
            >
              {w}
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-accent/70 shadow-[0_0_18px_var(--accent-glow)] sm:h-3.5 sm:w-3.5" aria-hidden="true" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function KineticBand() {
  return (
    <section className="border-y border-border bg-background py-14 sm:py-20" aria-hidden="true">
      <div className="space-y-4 sm:space-y-6">
        <Row words={rowA} from="0%" to="-35%" />
        <Row words={rowB} from="-35%" to="0%" outline />
      </div>
    </section>
  );
}
