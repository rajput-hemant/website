import { type ComponentType, type ReactNode, type SVGProps } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText, Mail, Printer } from "lucide-react";

import type { Link as ProfileLink } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { CopyEmail } from "@/components/copy-email";

import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "./brand-icons";

type Icon = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;

/**
 * The channels the row knows how to draw, matched by host. Other profile
 * links (the owner's own website, which is this site) stay in the footer and
 * the markdown mirror.
 */
const channels: { hosts: readonly string[]; icon: Icon }[] = [
  { hosts: ["github.com"], icon: GitHubIcon },
  { hosts: ["linkedin.com"], icon: LinkedInIcon },
  { hosts: ["wa.me", "whatsapp.com", "api.whatsapp.com"], icon: WhatsAppIcon },
];

function channelIcon(url: string): Icon | null {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  return (
    channels.find((channel) =>
      channel.hosts.some(
        (known) => host === known || host.endsWith(`.${known}`)
      )
    )?.icon ?? null
  );
}

const itemClass =
  "group/contact hit-area -mx-1 inline-flex items-center gap-1.5 rounded-sm px-1 whitespace-nowrap text-muted transition-colors duration-(--duration-exit) hover:text-foreground focus-visible:outline-offset-0";

const iconClass =
  "size-3.5 shrink-0 text-subtle transition-colors duration-(--duration-exit) group-hover/contact:text-foreground";

function ExternalArrow() {
  return (
    <ArrowUpRight
      aria-hidden
      strokeWidth={1.75}
      className="-ml-0.5 size-[0.85em] shrink-0 text-faint transition-[translate,color] duration-(--duration-enter) ease-enter group-hover/contact:translate-x-[0.1em] group-hover/contact:-translate-y-[0.1em] group-hover/contact:text-accent"
    />
  );
}

function ContactLink({
  href,
  icon: IconComponent,
  children,
  external,
  prefetch,
}: {
  href: string;
  icon: Icon;
  children: ReactNode;
  external?: boolean;
  prefetch?: boolean;
}) {
  const content = (
    <>
      <IconComponent aria-hidden strokeWidth={1.75} className={iconClass} />
      {children}
      {external && <ExternalArrow />}
    </>
  );

  if (!external) {
    return (
      <Link href={href} prefetch={prefetch} className={itemClass}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="external"
      className={itemClass}
    >
      {content}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export type ContactRowProps = {
  email: string;
  links: readonly ProfileLink[];
  /** The hosted resume; its link appears only when set. */
  resumeUrl?: string;
  className?: string;
};

/**
 * Every way to reach the owner, always visible on the first screen: the
 * address with a copy button, then the profiles and both resumes. Marked
 * `data-contact` so link previews stay out of it.
 */
export function ContactRow({
  email,
  links,
  resumeUrl,
  className,
}: ContactRowProps) {
  const profiles = links.flatMap((link) => {
    const icon = channelIcon(link.url);
    return icon ? [{ ...link, icon }] : [];
  });

  return (
    <nav
      aria-label="Contact"
      data-contact
      data-no-preview
      className={cn("grid gap-2.5 text-sm", className)}
    >
      {email && (
        <p className="flex items-center gap-1.5 text-muted">
          <Mail aria-hidden strokeWidth={1.75} className={iconClass} />
          <CopyEmail email={email} />
        </p>
      )}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pointer-coarse:gap-y-4">
        {profiles.map((profile) => (
          <li key={profile.url}>
            <ContactLink href={profile.url} icon={profile.icon} external>
              {profile.label}
            </ContactLink>
          </li>
        ))}
        {resumeUrl && (
          <li>
            <ContactLink href={resumeUrl} icon={FileText} external>
              Resume
            </ContactLink>
          </li>
        )}
        <li>
          {/* /resume has its own print stylesheet; prefetching it preloads CSS this page never applies. */}
          <ContactLink href="/resume" icon={Printer} prefetch={false}>
            Printable resume
          </ContactLink>
        </li>
      </ul>
    </nav>
  );
}
