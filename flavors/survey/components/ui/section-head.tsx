import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

export type SectionHeadProps = {
  /** Map capitals above the heading: the grid square or a count. */
  kicker?: string;
  title: React.ReactNode;
  /** An italic note, or a link, on the right. */
  aside?: React.ReactNode;
  as?: "h2" | "h3";
  id?: string;
  className?: string;
};

/** A sheet's title band: spaced capitals over a heavy neat line, a note on the right. */
export function SectionHead({
  kicker,
  title,
  aside,
  as: Heading = "h2",
  id,
  className,
}: SectionHeadProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-end gap-x-8 gap-y-3 border-b-[1.5px] border-rule-strong pb-4 sm:grid-cols-[1fr_auto]",
        className
      )}
    >
      <div className="min-w-0">
        {kicker ? <p className="caps text-ink-faint">{kicker}</p> : null}
        <Heading
          id={id}
          className={cn(
            "spaced scroll-mt-[calc(var(--header-height)+1rem)] break-words",
            Heading === "h2" ? "text-h2" : "text-h3 tracking-[0.2em]",
            kicker && "mt-2.5"
          )}
        >
          {title}
        </Heading>
      </div>
      {aside ? (
        <div
          className={cn(
            "justify-self-start sm:justify-self-end",
            typeof aside === "string" &&
              "font-serif text-lead text-ink-soft italic"
          )}
        >
          {aside}
        </div>
      ) : null}
    </div>
  );
}
