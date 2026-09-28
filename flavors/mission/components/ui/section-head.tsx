import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";

/**
 * A section of the flight plan: its number in signal red, the title, and a
 * mono note on the right, all under a heavy ink rule.
 */
export function SectionHead({
  id,
  number,
  title,
  aside,
  action,
  size = "title",
  className,
}: {
  id: string;
  /** The section number, e.g. `2.0`. */
  number?: string;
  title: React.ReactNode;
  /** Mono note on the right. */
  aside?: React.ReactNode;
  /** A link or control on the right, in text type. */
  action?: React.ReactNode;
  size?: "title" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-6 gap-y-3 border-t-2 border-ink pt-3.5 md:grid-cols-12 md:items-start",
        className
      )}
    >
      {number ? (
        <span className="label font-semibold text-signal md:col-span-2">
          {number}
        </span>
      ) : null}
      <h2
        id={id}
        className={cn(
          size === "title" ? "text-h2" : "text-h3",
          number ? "md:col-span-6" : "md:col-span-8"
        )}
      >
        {title}
      </h2>
      {aside || action ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 md:col-span-4 md:justify-end md:text-right">
          {aside ? <p className="label text-ink-soft">{aside}</p> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
