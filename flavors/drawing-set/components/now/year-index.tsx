import { SceneView } from "@/flavors/drawing-set/components/site/scene-view";
import { PilesPoster } from "@/flavors/drawing-set/components/site/view-posters";
import { cn } from "@/flavors/drawing-set/lib/utils";

import type { ChangelogYear } from "@/lib/data/group-by-year";

/**
 * A jump list of years with their entry counts, targeting each year's
 * drawer. On wide screens the scene piles each year's sheets beside it (N2).
 */
export function YearIndex({
  years,
  className,
}: {
  years: ChangelogYear[];
  className?: string;
}) {
  return (
    <nav aria-label="Jump to year" className={cn("relative", className)}>
      <SceneView
        id="piles"
        className="pointer-events-none absolute inset-y-0 right-full mr-2 hidden w-16 lg:block"
        poster={<PilesPoster counts={years.map((y) => y.entries.length)} />}
      />
      <ul className="flex flex-wrap gap-1 lg:grid lg:justify-items-end">
        {years.map(({ year, entries }) => (
          <li key={year}>
            <a
              href={`#log-${year}`}
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-mono-xs text-ink-soft tabular-nums transition-colors duration-(--duration-ui) fine:hover:text-ink"
            >
              {year}
              <span className="text-ink-faint">{entries.length}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
