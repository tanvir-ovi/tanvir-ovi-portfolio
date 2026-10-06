"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

/* Recognition: real photographs from the award ceremonies, untouched apart
 * from cropping. The lead photo unmasks and drifts on scroll; the supporting
 * frames move at different rates so the grid gains depth as it passes. */

function ParallaxFrame({
  src,
  alt,
  width,
  height,
  speed,
  className,
  imgClassName,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  speed: number;
  className?: string;
  imgClassName?: string;
  sizes: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed}%`, `${speed}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-lg border border-border bg-background-elevated ${className ?? ""}`}>
      <motion.div style={reduce ? undefined : { y, scale: 1 + speed / 50 }} className="h-full w-full">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={`h-full w-full object-cover ${imgClassName ?? ""}`}
        />
      </motion.div>
    </div>
  );
}

export function Recognition() {
  const leadRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: leadRef, offset: ["start end", "center center"] });
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(14% 10% 14% 10% round 18px)", "inset(0% 0% 0% 0% round 8px)"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);

  return (
    <section className="relative overflow-hidden border-t border-border py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-aurora-mesh opacity-60" aria-hidden="true" />
      <Container className="relative">
        <SectionHeading
          eyebrow="Recognition"
          title="Moments along the way"
          description="Second in a cohort of 63 in Electrical and Electronic Engineering, and a habit of finishing near the top that started well before university."
        />

        {/* Lead: Student Merit Award, EEE Fest 2025 */}
        <div ref={leadRef} className="mt-14">
          <motion.figure
            style={reduce ? undefined : { clipPath: clip }}
            className="relative w-full overflow-hidden rounded-lg border border-border bg-background-elevated sm:border-0"
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden sm:aspect-[16/9]">
              <motion.div style={reduce ? undefined : { scale: imgScale }} className="h-full w-full">
                <Image
                  src="/images/awards/merit-ceremony.webp"
                  alt="Tanvir Hossain Ovi receiving the Student Merit Award trophy from faculty of the Department of Electrical and Electronic Engineering at EEE Fest 2025, University of Chittagong"
                  width={2000}
                  height={1333}
                  sizes="(min-width: 1152px) 1100px, 100vw"
                  className="h-full w-full object-cover object-[50%_22%]"
                  priority={false}
                />
              </motion.div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgba(3,6,15,0.55)] to-transparent sm:h-2/3 sm:from-[rgba(3,6,15,0.92)] sm:via-[rgba(3,6,15,0.35)]" aria-hidden="true" />
            </div>
            {/* Phones set the caption under the photo so it never covers faces */}
            <figcaption className="p-5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-10">
              <p className="eyebrow-mono text-accent-strong">Feb 2025 · EEE Fest, University of Chittagong</p>
              <p className="mt-3 max-w-2xl font-display text-2xl leading-tight text-foreground sm:text-4xl">
                First Runner-up, <span className="italic text-aurora">Student Merit Award</span>
              </p>
              <p className="mt-2 max-w-xl text-sm text-foreground-muted sm:text-base">
                Presented by the Department of Electrical and Electronic Engineering.
              </p>
            </figcaption>
          </motion.figure>
        </div>

        {/* Supporting frames, each drifting at its own rate */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:mt-8 sm:grid-cols-12 sm:gap-6">
          <ParallaxFrame
            src="/images/awards/merit-portrait.webp"
            alt="Tanvir holding the Student Merit Award trophy and his farewell felicitation plaque at EEE Fest 2025"
            width={1100}
            height={1650}
            speed={6}
            sizes="(min-width: 640px) 30vw, 50vw"
            className="col-span-1 aspect-[3/4] sm:col-span-4 sm:row-span-2 sm:aspect-auto"
            imgClassName="object-[50%_30%]"
          />
          <ParallaxFrame
            src="/images/awards/principal-ceremony.webp"
            alt="Tanvir receiving the Principal's Award for Academic Excellence on stage at Dhaka Imperial College, 2018"
            width={718}
            height={613}
            speed={4}
            sizes="(min-width: 640px) 40vw, 50vw"
            className="col-span-1 aspect-[3/4] sm:col-span-5 sm:aspect-[7/6]"
          />
          <ParallaxFrame
            src="/images/awards/principal-portrait.webp"
            alt="Tanvir holding the Principal's Award trophy outside Dhaka Imperial College, September 2018"
            width={718}
            height={900}
            speed={8}
            sizes="(min-width: 640px) 25vw, 50vw"
            className="hidden aspect-[3/4] sm:col-span-3 sm:block sm:aspect-auto"
            imgClassName="object-[50%_25%]"
          />
          <Reveal className="col-span-2 flex flex-col justify-end rounded-lg border border-border bg-surface/60 p-5 backdrop-blur sm:col-span-8 sm:p-7">
            <p className="eyebrow-mono text-accent-strong">Sep 2018 · Dhaka Imperial College</p>
            <p className="mt-3 font-display text-xl leading-snug text-foreground sm:text-2xl">
              Principal&apos;s Award for Academic Excellence
            </p>
            <p className="mt-2 text-sm text-foreground-muted">
              4th position, Summer Semester Final Examination, Science group.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2 text-xs text-foreground-muted">
              <li className="rounded-lg border border-border-strong px-3 py-1.5 sm:rounded-full sm:py-1">Champion, Robo Soccer · EEE Fest 2023</li>
              <li className="rounded-lg border border-border-strong px-3 py-1.5 sm:rounded-full sm:py-1">2nd Runner-up, Robo Soccer · Engineering Day 2022</li>
              <li className="rounded-lg border border-border-strong px-3 py-1.5 sm:rounded-full sm:py-1">Government Junior Scholarship · 2014</li>
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
