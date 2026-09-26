import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

export type TitleBlockRow = { label: string; value: React.ReactNode };

export type TitleBlockProps = {
  rows: TitleBlockRow[];
  sheet: string;
  total: string;
  rev: string;
  className?: string;
};

const cell = "px-3 py-2";

/** The drawing-standard title block: a dl of facts, then the SHEET and REV cells. */
export function TitleBlock({
  rows,
  sheet,
  total,
  rev,
  className,
}: TitleBlockProps) {
  return (
    <div
      data-title-block
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] border border-line-strong font-mono text-mono-xs leading-none tracking-[0.07em] uppercase sm:inline-grid sm:grid-cols-[auto_auto]",
        className
      )}
    >
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] border-r border-line-strong">
        {rows.map((row, i) => {
          const last = i === rows.length - 1 ? "" : "border-b border-line";
          return (
            <React.Fragment key={row.label}>
              <dt className={cn(cell, last, "text-ink-faint")}>{row.label}</dt>
              <dd className={cn(cell, last, "text-ink")}>{row.value}</dd>
            </React.Fragment>
          );
        })}
      </dl>
      <div className="grid min-w-27 grid-rows-2">
        <p className={cn(cell, "flex flex-col justify-center gap-1.5")}>
          <span className="text-ink-faint">Sheet</span>
          <b className="font-display text-[1.3125rem] leading-none font-semibold tracking-[0.01em] [font-stretch:66%] tabular-nums">
            {sheet} / {total}
          </b>
        </p>
        <p
          className={cn(
            cell,
            "flex flex-col justify-center gap-1.5 border-t border-line-strong"
          )}
        >
          <span className="text-ink-faint">Rev</span>
          <b className="font-display text-[1.3125rem] leading-none font-semibold tracking-[0.01em] [font-stretch:66%] tabular-nums">
            {rev}
          </b>
        </p>
      </div>
    </div>
  );
}
