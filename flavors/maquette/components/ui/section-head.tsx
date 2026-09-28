import * as React from "react";
import { cn } from "@/flavors/maquette/lib/utils";

/** A section title over a strong rule, with caps print and a link on the right. */
export function SectionHead({
  id,
  kicker,
  title,
  aside,
  action,
  size = "h2",
  className,
}: {
  id: string;
  kicker?: React.ReactNode;
  title: React.ReactNode;
  /** A readout on the right. */
  aside?: React.ReactNode;
  /** A link or control on the right, set in text type. */
  action?: React.ReactNode;
  size?: "title" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-end gap-x-6 gap-y-4 border-b border-line pb-4 sm:grid-cols-[minmax(0,1fr)_auto]",
        className
      )}
    >
      <div className="min-w-0">
        {kicker ? <p className="mb-4 caps">{kicker}</p> : null}
        <h2
          id={id}
          className={cn(
            size === "title"
              ? "text-title"
              : size === "h2"
                ? "text-h2"
                : "text-h3"
          )}
        >
          {title}
        </h2>
      </div>
      {aside || action ? (
        <div className="grid gap-1.5 sm:justify-items-end sm:text-right">
          {aside ? <div className="grid gap-1.5 num">{aside}</div> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
