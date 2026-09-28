import * as React from "react";
import { cn } from "@/flavors/maquette/lib/utils";

import { safeHref } from "@/lib/safe-href";

/** A link off the site: new tab, no referrer, said aloud. */
export function ExternalLink({
  href,
  arrow = true,
  className,
  children,
}: {
  href: string;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={safeHref(href)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "underline decoration-cut underline-offset-[0.22em] fine:hover:decoration-2",
        className
      )}
    >
      {children}
      {arrow ? <span aria-hidden> ↗</span> : null}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
