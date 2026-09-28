import type { SearchIndex } from "./types";

export function localizeSearchIndex(
  index: SearchIndex,
  hrefForUpdate: (year: string) => string
): SearchIndex {
  let changed = false;
  const entries = index.entries.map((entry) => {
    if (entry.group !== "Changelog") return entry;
    const year = entry.href.split("#")[1];
    if (!year) return entry;
    const href = hrefForUpdate(year);
    if (href === entry.href) return entry;
    changed = true;
    return { ...entry, href };
  });
  return changed ? { ...index, entries } : index;
}
