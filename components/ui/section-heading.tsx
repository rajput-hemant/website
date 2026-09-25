import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

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
    <div className={cn("mb-8 flex items-end justify-between gap-6", className)}>
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
        <Link
          href={link.href}
          className="group/section flex shrink-0 items-center gap-1.5 pb-1.5 meta text-muted transition-colors hover:text-foreground"
        >
          {link.label}
          <ArrowRight
            aria-hidden
            strokeWidth={1.75}
            className="size-3 transition-transform duration-200 ease-snappy group-hover/section:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}
