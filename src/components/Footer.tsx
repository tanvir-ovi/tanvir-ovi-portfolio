import Link from "next/link";
import Image from "next/image";
import { EnvelopeSimple, LinkedinLogo, GithubLogo, GraduationCap } from "@phosphor-icons/react/dist/ssr";
import { navLinks, profile, site } from "@/lib/data";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { SplitWords } from "./ui/SplitWords";
import { LiveTrace } from "./LiveTrace";
import { LocalTime } from "./LocalTime";
import { ResearchGateLogo, OrcidLogo } from "./icons/BrandIcons";

const socials = [
  { href: `mailto:${profile.email}`, label: "Email", icon: EnvelopeSimple },
  { href: profile.links.linkedin, label: "LinkedIn", icon: LinkedinLogo },
  { href: profile.links.github, label: "GitHub", icon: GithubLogo },
  { href: profile.links.scholar, label: "Google Scholar", icon: GraduationCap },
  { href: profile.links.researchgate, label: "ResearchGate", icon: ResearchGateLogo },
  { href: profile.links.orcid, label: "ORCID", icon: OrcidLogo },
];

export function Footer() {
  const city = profile.location.split(",")[0];

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background-elevated">
      {/* Sign-off: a live trace that answers the pointer, then the name set large */}
      <div className="relative">
        <LiveTrace className="block h-24 w-full cursor-crosshair touch-pan-y sm:h-28" />
        <p className="pointer-events-none absolute right-4 top-3 hidden font-mono text-[0.62rem] uppercase tracking-[0.22em] text-foreground-faint sm:right-8 md:block">
          Move across the trace. Click to fire a spike.
        </p>
      </div>

      <Container className="pt-6 sm:pt-10">
        <Reveal variant="group">
          <p className="font-display text-[clamp(2.6rem,8.2vw,7.4rem)] font-normal leading-[0.95] tracking-[-0.035em] text-foreground">
            <SplitWords text={profile.name} />
          </p>
        </Reveal>
      </Container>

      <Container className="mt-10 flex flex-col gap-8 border-t border-border py-10 sm:mt-14 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-accent/20">
              <Image
                src="/images/logo.png"
                alt=""
                width={80}
                height={80}
                className="h-[128%] w-[128%] max-w-none object-cover"
              />
            </span>
            <p className="text-sm leading-relaxed text-foreground-muted">
              {profile.role}
              <br />
              {profile.location}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {socials.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-foreground-muted transition-[color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:hover:translate-y-0"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:items-end">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-underline text-foreground-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <LocalTime city={city} />
        </div>
      </Container>
      <Container className="border-t border-border py-6">
        <p className="text-xs text-foreground-faint">
          © {new Date().getFullYear()} {profile.name}. {site.nav.footerNote}
        </p>
      </Container>
    </footer>
  );
}
