import * as React from "react";
import { ArrowLink } from "@/flavors/minimal/components/ui/arrow-link";

export type HomeSectionProps = {
  /** Used for the heading id and the section's accessible name. */
  id: string;
  title: React.ReactNode;
  /** A quiet onward link on the right, e.g. "All projects". */
  link?: { href: string; label: string };
  as?: "h2" | "h3";
  className?: string;
  children: React.ReactNode;
};

/**
 * A home section under a small label rather than a display heading: the
 * intro's headline stays the only loud type on the page.
 */
export function HomeSection({
  id,
  title,
  link,
  as: Heading = "h2",
  className,
  children,
}: HomeSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-6">
        <Heading id={headingId} className="meta text-subtle">
          {title}
        </Heading>
        {link && (
          <ArrowLink
            href={link.href}
            className="shrink-0 meta text-subtle hover:text-foreground"
          >
            {link.label}
          </ArrowLink>
        )}
      </div>
      {children}
    </section>
  );
}
