"use client";

import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

import { motionOn } from "@/lib/motion/entrance";
import {
  useRowFilter,
  type RowFilterOption,
} from "@/components/semantic/filter/use-row-filter";

export type { RowFilterOption };

/** A key of conditions or categories that filters the rows below it. */
export function RowFilter({
  boardId,
  filterKey,
  label,
  allLabel,
  options,
  className,
}: {
  boardId: string;
  filterKey: string;
  label: string;
  allLabel: string;
  options: RowFilterOption[];
  className?: string;
}) {
  const { active, choose, total } = useRowFilter(boardId, filterKey, options);
  const changed = React.useRef(false);

  // The rows the filter kept settle in; the ones it removed went at once.
  // Motion off keeps the fade and drops the rise.
  React.useEffect(() => {
    if (!changed.current) {
      changed.current = true;
      return;
    }
    const rows = document.querySelectorAll<HTMLElement>(
      `#${boardId} [data-${filterKey}]:not([hidden])`
    );
    const rise = motionOn();
    rows.forEach((row, i) => {
      row.animate(
        [
          { opacity: 0, transform: rise ? "translateY(4px)" : "none" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: rise ? 160 : 120,
          delay: Math.min(i, 6) * 20,
          easing: rise ? "cubic-bezier(0.23, 1, 0.32, 1)" : "linear",
          fill: "backwards",
        }
      );
    });
  }, [active, boardId, filterKey]);

  const chip = (pressed: boolean) =>
    cn(
      "press caps inline-flex min-h-11 items-center gap-2 border px-3 transition-colors duration-150",
      pressed
        ? "border-ink bg-ink text-sheet"
        : "border-rule text-ink-soft fine:hover:border-ink fine:hover:text-ink"
    );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-2", className)}
    >
      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => choose(null)}
        className={chip(active === null)}
      >
        {allLabel}
        <span className="tabular-nums opacity-70">{total}</span>
      </button>
      {options.map((option) => (
        <button
          key={option.slug}
          type="button"
          aria-pressed={active === option.slug}
          onClick={() => choose(active === option.slug ? null : option.slug)}
          className={chip(active === option.slug)}
        >
          {option.label}
          <span className="tabular-nums opacity-70">{option.count}</span>
        </button>
      ))}
    </div>
  );
}
