import { Disclosure } from "@/flavors/minimal/components/ui/disclosure";

import { type ChangelogYear as Year } from "@/lib/data/group-by-year";

import { ChangelogEntry } from "./changelog-entry";

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
      summaryClassName="-mx-2 min-h-14 items-center rounded-sm px-2 py-3 transition-colors duration-(--duration-exit) active:bg-surface [&:active_.year-label]:text-accent [&:hover_.year-label]:text-accent"
      contentClassName="pb-4 sm:pl-5.5"
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
