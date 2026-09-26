import type { ChangelogYear } from "@/lib/data/group-by-year";
import { Disclosure, Schedule } from "@/components/ui";

import { revisionRow } from "./log-entry";
import type { RevisionEntry } from "./types";

export const entriesLabel = (count: number) =>
  count === 1 ? "1 entry" : `${count} entries`;

/** One year's drawer: a "2024 · 3 entries" summary that opens onto its revision table. */
export function LogYear({
  year,
  entries,
  defaultOpen = false,
}: ChangelogYear<RevisionEntry> & { defaultOpen?: boolean }) {
  return (
    <Disclosure
      id={`log-${year}`}
      defaultOpen={defaultOpen}
      className="scroll-mt-[calc(var(--header-height)+1rem)] border-b border-line"
      summaryClassName="items-center py-4"
      contentClassName="pt-2 pb-6"
      summary={
        <span className="flex items-baseline gap-3">
          <span className="font-display text-2xl text-ink tabular-nums">
            {year}
          </span>
          <span className="font-mono text-mono-xs text-ink-faint tabular-nums">
            {entriesLabel(entries.length)}
          </span>
        </span>
      }
    >
      <Schedule
        caption={`Revisions, ${year}`}
        columns={[
          { key: "rev", label: "Rev", className: "w-14" },
          { key: "date", label: "Date", className: "w-28" },
          { key: "description", label: "Description" },
          {
            key: "category",
            label: "Category",
            align: "right",
            className: "w-32",
          },
        ]}
        rows={entries.map(revisionRow)}
      />
    </Disclosure>
  );
}
