import * as React from "react";
import { cn } from "@/flavors/jacquard/lib/utils";

/** A section title over a strong rule, with its catalogue line on the right. */
export function SectionHead({
  id,
  title,
  aside,
  action,
  size = "title",
  className,
}: {
  id: string;
  title: React.ReactNode;
  /** Mono catalogue line on the right. */
  aside?: React.ReactNode;
  /** A link or control on the right, in text type. */
  action?: React.ReactNode;
  size?: "title" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-rule-strong pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className
      )}
    >
      <h2 id={id} className={size === "title" ? "text-h2" : "text-h3"}>
        {title}
      </h2>
      {aside || action ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 sm:justify-end sm:pb-1.5">
          {aside ? <p className="label">{aside}</p> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
