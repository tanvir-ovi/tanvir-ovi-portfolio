"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/* Hairline aurora bar along the top edge that fills with page progress */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  return (
    <motion.div
      style={{ scaleX, background: "var(--aurora)" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
      aria-hidden="true"
    />
  );
}
