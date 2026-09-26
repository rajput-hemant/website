import { type Update } from "@/lib/data/types";

export type ChangelogYear = { year: string; entries: Update[] };

/** Groups newest-first entries by year, keeping their order. */
export function groupByYear(entries: readonly Update[]): ChangelogYear[] {
  const groups: ChangelogYear[] = [];
  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    const last = groups.at(-1);
    if (last?.year === year) last.entries.push(entry);
    else groups.push({ year, entries: [entry] });
  }
  return groups;
}
