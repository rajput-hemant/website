import { type ChangelogYear } from "./group-by-year";

/** A jump list of years with their entry counts. */
export function YearIndex({ years }: { years: ChangelogYear[] }) {
  return (
    <nav aria-label="Jump to year">
      <ul className="-ml-2 flex flex-wrap gap-1">
        {years.map(({ year, entries }) => (
          <li key={year}>
            <a
              href={`#${year}`}
              className="group/year inline-flex items-baseline gap-1 rounded-sm px-2 py-1 font-mono text-sm text-muted tabular-nums transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {year}
              <span className="text-2xs text-subtle transition-colors group-hover/year:text-accent">
                {entries.length}
                <span className="sr-only">
                  {entries.length === 1 ? " entry" : " entries"}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
