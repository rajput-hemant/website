"use client";

import * as React from "react";

import type { ChangelogYear } from "@/lib/data/group-by-year";
import type { UpdateCategory } from "@/lib/data/types";

import { CategoryFilter } from "./category-filter";
import { LogYear } from "./log-year";
import { YearIndex } from "./year-index";

/**
 * The changelog, card-catalogue style: category chips filter the client-only
 * state, which is progressive enhancement, everything is already in the DOM
 * with the chips unclicked, so the log reads the same with no JS.
 */
export function Log({ years }: { years: ChangelogYear[] }) {
  const categories = React.useMemo(
    () =>
      Array.from(
        new Set(years.flatMap((year) => year.entries.map((e) => e.category)))
      ),
    [years]
  );
  const [active, setActive] = React.useState<UpdateCategory | null>(null);

  const filtered = active
    ? years
        .map((year) => ({
          ...year,
          entries: year.entries.filter((entry) => entry.category === active),
        }))
        .filter((year) => year.entries.length > 0)
    : years;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <CategoryFilter
          categories={categories}
          active={active}
          onChange={setActive}
        />
        {filtered.length > 1 && (
          <YearIndex
            years={filtered}
            className="lg:sticky lg:top-[calc(var(--header-height)+1rem)]"
          />
        )}
      </div>
      <div className="mt-4 border-t border-hairline">
        {filtered.map((year, index) => (
          <LogYear key={year.year} {...year} defaultOpen={index === 0} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-graphite">No entries in this category.</p>
        )}
      </div>
    </div>
  );
}
