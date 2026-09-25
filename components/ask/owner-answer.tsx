import { type ReactNode } from "react";

import { site } from "@/content/site";
import { cn } from "@/lib/utils";

/** The owner's voice in a thread: a name label and an accent rule down the left. */
export function OwnerAnswer({
  label = "answered",
  children,
  className,
}: {
  /** Follows the name, e.g. "answered · Sep 25, 2026". */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-l-2 border-accent/70 pl-4 sm:pl-5", className)}>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="wordmark text-base leading-none text-foreground">
          {site.name}
          <span aria-hidden className="text-accent">
            .
          </span>
        </span>
        <span className="meta text-subtle">{label}</span>
      </p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}
