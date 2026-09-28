import type { LiveFlavorId } from "@/flavors/registry";

import { changelogUpdateHref, flavorHasChangelogPage } from "./changelog-href";
import type { SearchIndex } from "./types";

/** Rewrites changelog entry hrefs for the visitor's edition. `/search.json` is shared. */
export function localizeSearchIndex(
  index: SearchIndex,
  flavor: LiveFlavorId
): SearchIndex {
  if (flavorHasChangelogPage(flavor)) return index;
  return {
    ...index,
    entries: index.entries.map((entry) => {
      if (entry.group !== "Changelog") return entry;
      const year = entry.href.split("#")[1];
      if (!year) return entry;
      return { ...entry, href: changelogUpdateHref(flavor, year) };
    }),
  };
}
