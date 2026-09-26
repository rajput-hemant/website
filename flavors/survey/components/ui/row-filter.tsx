"use client";

import { cn } from "@/flavors/survey/lib/utils";

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
