import type { ChangelogYear } from "@/lib/data/group-by-year";

/** A jump list of years with their entry counts, targeting each year's drawer. */
export function YearIndex({
  years,
  className,
}: {
  years: ChangelogYear[];
  className?: string;
}) {
  return (
    <nav aria-label="Jump to year" className={className}>
      <ul className="flex flex-wrap gap-1 lg:grid lg:justify-items-end">
        {years.map(({ year, entries }) => (
          <li key={year}>
            <a
              href={`#log-${year}`}
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-mono-xs text-graphite tabular-nums transition-colors duration-(--duration-ui) hover:text-paper"
            >
              {year}
              <span className="text-pencil">{entries.length}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
