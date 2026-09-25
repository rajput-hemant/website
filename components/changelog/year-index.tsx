import { type ChangelogYear } from "./group-by-year";

/**
 * A jump list of years with their entry counts, pinned in the left margin on
 * wide screens. Below that the collapsed year rows are the index.
 */
export function YearIndex({
  years,
  className,
}: {
  years: ChangelogYear[];
  className?: string;
}) {
  return (
    <nav aria-label="Jump to year" className={className}>
      <ul className="grid justify-items-end">
        {years.map(({ year, entries }) => (
          <li key={year}>
            <a
              href={`#${year}`}
              className="group/year inline-flex h-8 items-center gap-2 rounded-sm px-2 font-mono text-xs text-muted tabular-nums transition-colors hover:text-foreground"
            >
              {year}
              <span className="w-4 text-right text-2xs text-subtle transition-colors group-hover/year:text-accent">
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
