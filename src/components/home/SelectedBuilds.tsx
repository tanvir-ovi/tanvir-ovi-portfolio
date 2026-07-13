import { ArrowUpRight, LockSimple } from "@phosphor-icons/react/dist/ssr";
import { projects, type Project } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { cn } from "@/lib/cn";

export function SelectedBuilds() {
  return (
    <section id="projects" className="border-t border-border py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Selected builds"
          title="Research isn't the only thing I ship"
          description="Alongside the science, I design and engineer real software end to end: full-stack PWAs I use every day. Proof that I can take an idea from problem to a deployed product."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08} className="h-full">
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const violet = p.accent === "violet";
  const linkColor = violet ? "text-accent-2" : "text-accent";
  const glow = violet ? "rgba(139,125,255,0.5)" : "rgba(56,189,248,0.5)";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
        violet ? "hover:border-accent-2/40" : "hover:border-accent/40"
      )}
    >
      {/* Corner glow on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-70"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <span className="eyebrow-mono">{p.kind}</span>
        {p.locked ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-2/30 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-wider text-accent-2">
            <LockSimple size={11} weight="bold" />
            Encrypted
          </span>
        ) : p.url ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-wider text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Live
          </span>
        ) : null}
      </div>

      <h3 className="relative mt-5 font-display text-[1.6rem] leading-tight text-foreground">
        {p.name}
      </h3>
      <p className="relative mt-3 flex-1 text-sm leading-relaxed text-foreground-muted">
        {p.description}
      </p>

      <ul className="relative mt-6 flex flex-wrap gap-2">
        {p.tech.map((t) => (
          <li
            key={t}
            className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-foreground-faint"
          >
            {t}
          </li>
        ))}
      </ul>

      <div className="relative mt-7 border-t border-border pt-5">
        {p.url ? (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group/link inline-flex items-center gap-2 text-sm font-medium transition-colors",
              linkColor
            )}
          >
            View live
            <ArrowUpRight
              size={16}
              weight="bold"
              className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            />
          </a>
        ) : p.locked ? (
          <span className="inline-flex items-center gap-2 text-sm text-foreground-faint">
            <LockSimple size={15} weight="bold" />
            Private, encrypted build
          </span>
        ) : (
          <span className="text-sm text-foreground-faint">Live link coming soon</span>
        )}
      </div>
    </article>
  );
}
