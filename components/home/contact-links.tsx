import type { Link } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { CopyEmail } from "@/components/copy-email";
import { ExternalLink } from "@/components/ui/external-link";

export type ContactLinksProps = {
  email: string;
  links: readonly Link[];
  className?: string;
};

export function ContactLinks({ email, links, className }: ContactLinksProps) {
  if (!email && links.length === 0) return null;

  return (
    <nav
      aria-label="Contact"
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-3 text-sm",
        className
      )}
    >
      {email && <CopyEmail email={email} />}
      {links.length > 0 && (
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {links.map((link) => (
            <li key={link.url}>
              <ExternalLink href={link.url}>{link.label}</ExternalLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
