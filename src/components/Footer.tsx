import Link from "next/link";
import Image from "next/image";
import { EnvelopeSimple, LinkedinLogo, GithubLogo, GraduationCap } from "@phosphor-icons/react/dist/ssr";
import { navLinks, profile } from "@/lib/data";
import { Container } from "./ui/Container";
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
  return (
    <footer className="border-t border-border bg-background-elevated">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
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
            <p className="text-sm font-semibold text-foreground">{profile.name}</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            {profile.role} · {profile.location}
          </p>
          <div className="mt-4 flex items-center gap-3">
            {socials.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong text-foreground-muted transition-colors hover:border-accent/50 hover:text-accent-strong"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
      <Container className="border-t border-border py-6">
        <p className="text-xs text-foreground-faint">
          © {new Date().getFullYear()} {profile.name}. Built with Next.js.
        </p>
      </Container>
    </footer>
  );
}
