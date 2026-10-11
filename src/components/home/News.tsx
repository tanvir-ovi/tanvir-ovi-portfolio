import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/data";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

/* A short dated log of milestones, edited from the admin panel. Internal links
 * use client navigation; anything else opens in a new tab. */
export function News() {
  const news = site.home.news;
  if (!news.items.length) return null;

  return (
    <section className="border-t border-border py-24 sm:py-32">
      <Container className="lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow={news.eyebrow}
            title={news.title}
            description={news.description || undefined}
          />
        </div>

        <Reveal as="ol" className="mt-12 border-t border-border lg:mt-1">
          {news.items.map((item, i) => {
            const body = (
              <>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent-strong sm:pt-1">
                  {item.date}
                </span>
                <span className="flex items-start gap-2 text-sm leading-relaxed text-foreground-muted transition-colors duration-300 group-hover:text-foreground sm:text-base">
                  <span>{item.text}</span>
                  {item.link ? (
                    <ArrowUpRight
                      size={15}
                      className="mt-1 shrink-0 text-foreground-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-strong"
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
              </>
            );
            const rowClass =
              "group grid grid-cols-1 gap-2 border-b border-border py-6 sm:grid-cols-[7rem_1fr] sm:gap-8";
            return (
              <li key={`${item.date}-${i}`}>
                {!item.link ? (
                  <div className={rowClass}>{body}</div>
                ) : item.link.startsWith("/") ? (
                  <Link href={item.link} className={rowClass}>
                    {body}
                  </Link>
                ) : (
                  <a href={item.link} target="_blank" rel="noreferrer" className={rowClass}>
                    {body}
                  </a>
                )}
              </li>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}
