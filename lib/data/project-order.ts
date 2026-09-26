import type { Project } from "./types";

/** Catalogue and prev/next links: by year, then name; unset years last. */
export function orderProjectsForCatalog(
  projects: readonly Project[]
): Project[] {
  return [...projects].sort(
    (a, b) =>
      (a.year ?? Number.POSITIVE_INFINITY) -
        (b.year ?? Number.POSITIVE_INFINITY) ||
      a.name.localeCompare(b.name)
  );
}
