import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

import { type ChangelogYear } from "@/lib/data/group-by-year";

const linkClass =
  "group/year inline-flex h-8 items-center gap-2 rounded-sm font-mono text-muted tabular-nums transition-colors duration-(--duration-exit) hover:text-foreground active:bg-surface active:text-foreground";

function Count({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "text-2xs text-subtle transition-colors group-hover/year:text-accent",
        className
      )}
    >
      {count}
      <span className="sr-only">{count === 1 ? " entry" : " entries"}</span>
    </span>
  );
}

/**
 * A jump list of years with their entry counts. `rail` pins it in the left
 * margin (from `lg`), where from `xl` a hairline bar also sizes each year
 * against the busiest one. `row` is the tablet form: the margin there is
 * only a gutter, so the years run in a line above the list. Below `md` the
 * collapsed year rows are the index.
 */
export function YearIndex({
  years,
  layout = "rail",
  className,
}: {
  years: ChangelogYear[];
  layout?: "rail" | "row";
  className?: string;
}) {
  if (layout === "row") {
    return (
      <nav aria-label="Jump to year" className={className}>
        <ul className="-mx-2 flex flex-wrap gap-x-1">
          {years.map(({ year, entries }) => (
            <li key={year}>
              <a href={`#${year}`} className={cn(linkClass, "px-2 text-xs")}>
                {year}
                <Count count={entries.length} />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  const most = Math.max(1, ...years.map(({ entries }) => entries.length));

  return (
    <nav aria-label="Jump to year" className={className}>
      <ul className="grid justify-items-end">
        {years.map(({ year, entries }) => (
          <li key={year}>
            <a href={`#${year}`} className={cn(linkClass, "px-2 text-xs")}>
              <span
                aria-hidden
                className="hidden h-px w-(--bar) bg-border transition-colors group-hover/year:bg-accent xl:block"
                style={
                  {
                    "--bar": `${(entries.length / most) * 3}rem`,
                  } as React.CSSProperties
                }
              />
              {year}
              <Count count={entries.length} className="w-4 text-right" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
