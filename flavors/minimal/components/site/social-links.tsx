import { ExternalLink } from "@/flavors/minimal/components/ui/external-link";
import { cn } from "@/flavors/minimal/lib/utils";

import type { Link } from "@/lib/data/types";

/**
 * Social profiles as a quiet inline row (the footer's). The group is plainly
 * external, so the links drop the underline and ↗ that body links carry.
 */
export function SocialLinks({
  links,
  className,
}: {
  links: readonly Link[];
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <ul
      className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}
    >
      {links.map((link) => (
        <li key={link.url}>
          <ExternalLink
            href={link.url}
            underline={false}
            arrow={false}
            className="inline-flex min-h-10 items-center transition-colors hover:text-foreground"
          >
            {link.label}
          </ExternalLink>
        </li>
      ))}
    </ul>
  );
}
