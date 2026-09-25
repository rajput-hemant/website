import { Disclosure } from "@/components/ui/disclosure";

import { ChangelogEntry } from "./changelog-entry";
import { type ChangelogYear as Year } from "./group-by-year";

export const entriesLabel = (count: number) =>
  count === 1 ? "1 entry" : `${count} entries`;

/** One year of entries behind a "2024 · 3 entries" summary. */
export function ChangelogYear({
  year,
  entries,
  defaultOpen = false,
}: Year & { defaultOpen?: boolean }) {
  return (
    <Disclosure
      id={year}
      defaultOpen={defaultOpen}
      className="scroll-mt-(--header-h) border-b border-hairline"
      summaryClassName="min-h-14 items-center py-3 transition-colors [&:hover_.year-label]:text-accent"
      contentClassName="pb-4 pl-5.5"
      summary={
        <span className="flex items-baseline gap-3">
          <span className="year-label display text-2xl font-book text-foreground tabular-nums transition-colors">
            {year}
          </span>
          <span className="meta text-subtle tabular-nums">
            {entriesLabel(entries.length)}
          </span>
        </span>
      }
    >
      <ol>
        {entries.map((entry) => (
          <ChangelogEntry key={entry.id} entry={entry} />
        ))}
      </ol>
    </Disclosure>
  );
}
