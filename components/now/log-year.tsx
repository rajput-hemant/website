import type { ChangelogYear } from "@/lib/data/group-by-year";
import { Disclosure } from "@/components/ui";

import { LogEntry } from "./log-entry";

export const entriesLabel = (count: number) =>
  count === 1 ? "1 entry" : `${count} entries`;

/** One year's drawer: a "2024 · 3 entries" summary that opens onto its index cards. */
export function LogYear({
  year,
  entries,
  defaultOpen = false,
}: ChangelogYear & { defaultOpen?: boolean }) {
  return (
    <Disclosure
      id={`log-${year}`}
      defaultOpen={defaultOpen}
      className="scroll-mt-[calc(var(--header-height)+1rem)] border-b border-hairline"
      summaryClassName="items-center py-4"
      contentClassName="grid gap-3 pt-2 pb-6"
      summary={
        <span className="flex items-baseline gap-3">
          <span className="font-display text-2xl text-paper tabular-nums">
            {year}
          </span>
          <span className="font-mono text-mono-xs text-pencil tabular-nums">
            {entriesLabel(entries.length)}
          </span>
        </span>
      }
    >
      <ul className="grid gap-3">
        {entries.map((entry) => (
          <LogEntry key={entry.id} entry={entry} />
        ))}
      </ul>
    </Disclosure>
  );
}
