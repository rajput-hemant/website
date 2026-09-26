import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";

import { Overprint } from "./overprint";

/** A section title in two plates, snapping into register as it scrolls in, with its slug and an aside. */
export function SectionHead({
  id,
  kicker,
  title,
  aside,
  action,
  size = "title",
  className,
}: {
  id: string;
  kicker?: React.ReactNode;
  title: React.ReactNode;
  /** Slug text on the right. */
  aside?: React.ReactNode;
  /** A link or control on the right, set in text type. */
  action?: React.ReactNode;
  size?: "title" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-end gap-x-6 gap-y-4 sm:grid-cols-[minmax(0,1fr)_auto]",
        className
      )}
    >
      <div className="min-w-0">
        {kicker ? <p className="mb-4 slug">{kicker}</p> : null}
        <Overprint
          as="h2"
          id={id}
          snap
          className={cn(
            "pb-[0.08em]",
            size === "title" ? "text-title" : "text-h2"
          )}
        >
          {title}
        </Overprint>
      </div>
      {aside || action ? (
        <div className="grid gap-1.5 pb-2 sm:justify-items-end sm:text-right">
          {aside ? <div className="grid gap-1.5 slug">{aside}</div> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
