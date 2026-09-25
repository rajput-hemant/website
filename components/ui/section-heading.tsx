import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ArrowLink } from "./arrow-link";

export type SectionHeadingProps = {
  title: ReactNode;
  /** Small mono label above the title. */
  eyebrow?: ReactNode;
  /** Optional right-aligned link, e.g. "All projects". */
  link?: { href: string; label: string };
  as?: "h2" | "h3";
  id?: string;
  className?: string;
};

export function SectionHeading({
  title,
  eyebrow,
  link,
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex items-baseline justify-between gap-6",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-3 flex items-center gap-2.5 meta text-subtle">
            <span aria-hidden className="h-px w-4 bg-accent" />
            {eyebrow}
          </p>
        )}
        <Heading id={id} className="display text-2xl text-foreground">
          {title}
        </Heading>
      </div>
      {link && (
        <ArrowLink
          href={link.href}
          className="shrink-0 meta text-muted hover:text-foreground"
        >
          {link.label}
        </ArrowLink>
      )}
    </div>
  );
}
