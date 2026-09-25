import { Reveal } from "@/components/interaction/reveal";

import { ChangelogEntry } from "./changelog-entry";
import { type ChangelogYear as Year } from "./group-by-year";

/** One year of entries; the year stays pinned beside its list on wider screens. */
export function ChangelogYear({ year, entries }: Year) {
  return (
    <Reveal
      as="section"
      aria-labelledby={year}
      className="grid border-t border-border pt-6 sm:grid-cols-[6rem_1fr] sm:gap-x-6"
    >
      <h2
        id={year}
        className="display text-2xl text-foreground tabular-nums sm:sticky sm:top-[calc(var(--header-h)+1.5rem)] sm:self-start"
      >
        {year}
      </h2>
      <ol className="mt-1 sm:-mt-5">
        {entries.map((entry) => (
          <ChangelogEntry key={entry.id} entry={entry} />
        ))}
      </ol>
    </Reveal>
  );
}
