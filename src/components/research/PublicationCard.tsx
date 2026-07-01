"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Publication } from "@/lib/data";
import { StatusBadge } from "../ui/Badge";
import { Reveal } from "../ui/Reveal";

export function PublicationCard({ pub, delay = 0 }: { pub: Publication; delay?: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <Reveal delay={delay}>
      <article
        id={pub.id}
        className="group relative scroll-mt-24 border-b border-border py-9 first:pt-0 last:border-b-0 sm:py-10"
      >
        {/* Hover marker - a fine accent line grows down the left edge */}
        <span
          className="absolute left-0 top-0 hidden h-0 w-px bg-accent/50 transition-[height] duration-500 ease-out group-hover:h-full sm:block"
          aria-hidden="true"
        />

        <div className="grid gap-x-10 gap-y-4 sm:grid-cols-[8rem_1fr] sm:pl-6">
          <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-col sm:items-start sm:gap-2.5">
            <StatusBadge status={pub.status} />
            <span className="font-display text-lg italic text-foreground-faint transition-colors duration-300 group-hover:text-accent-strong sm:text-xl">
              {pub.year}
            </span>
            {pub.firstAuthor ? (
              <span className="text-xs font-medium uppercase tracking-wide text-accent-strong">
                First author
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="flex items-start gap-2 text-balance text-lg font-medium leading-snug text-foreground transition-colors duration-300 group-hover:text-accent-strong sm:text-xl">
              <span>{pub.title}</span>
              <ArrowUpRight
                size={18}
                className="mt-1 hidden shrink-0 text-foreground-faint opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-strong group-hover:opacity-100 sm:block"
                aria-hidden="true"
              />
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{pub.authors}</p>
            <p className="mt-1 text-sm text-foreground-faint">{pub.venue}</p>

            {pub.abstract ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="mt-4 flex w-fit items-center gap-1.5 text-sm font-medium text-accent-strong transition-colors hover:text-accent"
                >
                  {open ? "Hide abstract" : "Read abstract"}
                  <CaretDown
                    size={14}
                    weight="bold"
                    className="transition-transform duration-300"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={panelId}
                      key="panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 max-w-2xl border-l-2 border-accent/30 pl-4 text-sm leading-relaxed text-foreground-muted">
                        {pub.abstract}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  );
}
