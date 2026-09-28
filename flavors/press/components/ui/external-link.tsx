import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";

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
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "underline decoration-pink decoration-2 underline-offset-[0.22em] fine:hover:decoration-blue",
        className
      )}
    >
      {children}
      {arrow ? <span aria-hidden> ↗</span> : null}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
