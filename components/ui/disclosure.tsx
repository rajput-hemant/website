import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type DisclosureProps = {
  /** Always-visible summary row; keep it to one line. */
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Anchor id; a URL hash targeting it (or anything inside) opens it. */
  id?: string;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
};

/**
 * The site's single progressive-disclosure primitive: a native <details>, so
 * content stays in the DOM for find-in-page, SEO, no-JS and print.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen,
  id,
  className,
  summaryClassName,
  contentClassName,
}: DisclosureProps) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={cn("group/disclosure", className)}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-baseline gap-2 [&::-webkit-details-marker]:hidden",
          summaryClassName
        )}
      >
        <ChevronRight
          aria-hidden
          strokeWidth={1.75}
          className="size-3.5 shrink-0 self-center text-subtle transition-transform duration-200 ease-snappy group-open/disclosure:rotate-90"
        />
        <span className="min-w-0 flex-1">{summary}</span>
      </summary>
      <div className={contentClassName}>{children}</div>
    </details>
  );
}
