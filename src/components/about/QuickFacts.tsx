import {
  DownloadSimple,
  MapPin,
  ChatCircleText,
  Target,
  GraduationCap,
  Briefcase,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { profile, site } from "@/lib/data";
import type { FactIcon } from "@/lib/content-types";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { ButtonLink } from "../ui/Button";

const icons: Record<FactIcon, typeof MapPin> = {
  location: MapPin,
  language: ChatCircleText,
  target: Target,
  school: GraduationCap,
  briefcase: Briefcase,
  sparkle: Sparkle,
};

const facts = site.about.facts.map((f) => ({ ...f, icon: icons[f.icon] ?? Sparkle }));

export function QuickFacts() {
  return (
    <section className="border-t border-border py-16 sm:py-20">
      <Container>
        {/* Editorial horizontal strip - three facts in a divided row */}
        <Reveal as="div">
          <dl className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-start gap-3.5 py-6 sm:px-6 sm:py-6 sm:first:pl-0 sm:last:pr-0">
                <fact.icon
                  size={16}
                  weight="duotone"
                  className="mt-0.5 shrink-0 text-accent-strong"
                />
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground-faint">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-foreground">
                    {fact.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* CV download strip */}
        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border border-accent/20 bg-accent-soft px-6 py-5 sm:flex-row sm:items-center">
            <p className="text-sm text-foreground">
              {site.about.cvPrompt}
            </p>
            <ButtonLink
              href={profile.cvPath}
              external
              icon={<DownloadSimple size={16} weight="bold" />}
              className="shrink-0"
            >
              {site.about.cvButton}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
