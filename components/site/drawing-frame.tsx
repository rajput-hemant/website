import type * as React from "react";

import { cn } from "@/lib/utils";

/** Shared with the cursor readout, which reports the same grid reference. */
export const GRID_COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const GRID_ROWS = ["1", "2", "3", "4", "5", "6", "7", "8"];

const delay = (ms: number) =>
  ({ "--plot-delay": `${ms}ms` }) as React.CSSProperties;

function Edge({ className, at }: { className: string; at: number }) {
  return (
    <span className={cn("absolute bg-line", className)} style={delay(at)} />
  );
}

/**
 * The fixed drawing frame and its grid reference ticks (desktop only). Its
 * outer shadow and tick bands are ground-coloured, so the sheet scrolls under
 * the frame like paper under a mat. Plots in on the first load of a session
 * (`data-plot`, set before paint in app/layout.tsx).
 */
export function DrawingFrame() {
  return (
    <div
      aria-hidden
      data-print="hide"
      className="pointer-events-none fixed inset-(--frame-inset) z-30 shadow-[0_0_0_var(--frame-inset)_var(--color-ground)]"
    >
      <Edge className="plot-x inset-x-0 top-0 h-px origin-left" at={0} />
      <Edge className="plot-y inset-y-0 right-0 w-px origin-top" at={100} />
      <Edge className="plot-x inset-x-0 bottom-0 h-px origin-right" at={200} />
      <Edge className="plot-y inset-y-0 left-0 w-px origin-bottom" at={300} />

      <div className="hidden md:block">
        <div className="absolute top-px right-px left-3.5 flex h-3.5 bg-ground">
          {GRID_COLUMNS.map((column, i) => (
            <span
              key={column}
              className="relative flex-1 text-center font-mono text-[0.625rem] leading-3.5 font-medium text-ink-faint"
            >
              {i > 0 && (
                <Edge
                  className="plot-y inset-y-0 left-0 w-px origin-top"
                  at={300 + i * 40}
                />
              )}
              {column}
            </span>
          ))}
        </div>
        <div className="absolute top-3.5 bottom-px left-px flex w-3.5 flex-col bg-ground">
          {GRID_ROWS.map((row, i) => (
            <span
              key={row}
              className="relative flex flex-1 items-center justify-center font-mono text-[0.625rem] font-medium text-ink-faint"
            >
              {i > 0 && (
                <Edge
                  className="plot-x inset-x-0 top-0 h-px origin-left"
                  at={300 + i * 40}
                />
              )}
              {row}
            </span>
          ))}
        </div>
        <Edge
          className="plot-x top-3.5 right-0 left-3.5 h-px origin-left"
          at={250}
        />
        <Edge
          className="plot-y top-3.5 bottom-0 left-3.5 w-px origin-top"
          at={250}
        />
      </div>
    </div>
  );
}
