import * as React from "react";
import { SplitHeading } from "@/flavors/drawing-set/components/motion/split-heading";
import { cn } from "@/flavors/drawing-set/lib/utils";

export type SheetHeadingProps = {
  n?: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  /** @default "h2" */
  as?: "h2" | "h3";
  id?: string;
  className?: string;
};

/** A section head: mono number column, condensed-caps title, mono aside, strong rule. */
export function SheetHeading({
  n,
  title,
  aside,
  as = "h2",
  id,
  className,
}: SheetHeadingProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6 gap-y-2 border-b border-line-strong pb-4 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto]",
        className
      )}
    >
      {n ? (
        <span className="col-span-full pb-1.5 font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase sm:col-span-1">
          {n}
        </span>
      ) : null}
      <SplitHeading
        as={as}
        id={id}
        className={cn(
          "font-display leading-[0.9] font-[540] tracking-[-0.005em] uppercase [font-stretch:62%]",
          as === "h2" ? "text-h2 sm:text-[3.5rem]" : "text-h3 sm:text-h2",
          !n && "sm:col-span-2"
        )}
      >
        {title}
      </SplitHeading>
      {aside ? (
        <div className="pb-1.5 text-right font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase">
          {aside}
        </div>
      ) : null}
    </div>
  );
}
