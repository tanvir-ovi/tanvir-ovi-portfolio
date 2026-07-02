"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";

/* Premium reveal: elements rise and resolve from a soft blur instead of a
 * flat fade, on a long ease-out curve. One reveal per section keeps the
 * motion editorial rather than busy. */
const variants: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(9px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

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
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];

  // With reduced motion, render fully visible with no transform or transition.
  if (prefersReducedMotion) {
    return <Component className={cn(className)}>{children}</Component>;
  }

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={variants}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
