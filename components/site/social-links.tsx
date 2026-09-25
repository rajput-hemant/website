import type { Link } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { ExternalLink } from "@/components/ui/external-link";

/** Social profiles as an inline row of external links. */
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
          <ExternalLink href={link.url}>{link.label}</ExternalLink>
        </li>
      ))}
    </ul>
  );
}
