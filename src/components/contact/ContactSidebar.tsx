import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import {
  EnvelopeSimple,
  LinkedinLogo,
  GithubLogo,
  GraduationCap,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import { profile } from "@/lib/data";
import { Reveal } from "../ui/Reveal";
import { ResearchGateLogo, OrcidLogo } from "../icons/BrandIcons";

const channels = [
  { label: "Email",         value: profile.email,            href: `mailto:${profile.email}`,   icon: EnvelopeSimple    },
  { label: "LinkedIn",      value: "View profile",           href: profile.links.linkedin,      icon: LinkedinLogo      },
  { label: "GitHub",        value: "View profile",           href: profile.links.github,        icon: GithubLogo        },
  { label: "Google Scholar",value: "View publications",      href: profile.links.scholar,       icon: GraduationCap     },
  { label: "ResearchGate",  value: "View profile",           href: profile.links.researchgate,  icon: ResearchGateLogo  },
  { label: "ORCID",         value: "0009-0001-8345-3843",    href: profile.links.orcid,         icon: OrcidLogo         },
];

export function ContactSidebar() {
  return (
    <Reveal className="divide-y divide-border border-y border-border">
      {channels.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}
            className="group flex items-center gap-4 py-5 transition-colors duration-200 hover:text-foreground"
          >
            <channel.icon
              size={16}
              weight="duotone"
              className="shrink-0 text-accent-strong transition-colors duration-200 group-hover:text-accent"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium uppercase tracking-wider text-foreground-faint">
                {channel.label}
              </span>
              <span className="block truncate text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-accent-strong">
                {channel.value}
              </span>
            </span>
            <ArrowUpRight
              size={13}
              className="shrink-0 text-foreground-faint opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-accent"
              aria-hidden="true"
            />
          </a>
      ))}

      {/* Location - non-interactive */}
      <div className="flex items-center gap-4 py-5 text-foreground-muted">
        <MapPin size={16} weight="duotone" className="shrink-0 text-foreground-faint" />
        <span>
          <span className="block text-xs font-medium uppercase tracking-wider text-foreground-faint">
            Based in
          </span>
          <span className="block text-sm font-medium text-foreground">{profile.location}</span>
        </span>
      </div>
    </Reveal>
  );
}
