import { type Update } from "@/lib/data/types";

export type ChangelogYear<T extends Update = Update> = {
  year: string;
  entries: T[];
};

/**
 * Groups newest-first entries by year, keeping their order. Generic so a
 * page can augment each entry (e.g. a revision number) before grouping and
 * keep that field's type through the grouped output.
 */
export function groupByYear<T extends Update>(
  entries: readonly T[]
): ChangelogYear<T>[] {
  const groups: ChangelogYear<T>[] = [];
  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    const last = groups.at(-1);
    if (last?.year === year) last.entries.push(entry);
    else groups.push({ year, entries: [entry] });
  }
  return groups;
}
