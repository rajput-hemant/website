import type { Project } from "@/lib/data/types";

import type { Site } from "./relief";

export type SurveyNeighbour = {
  slug: string;
  name: string;
  ref: string | null;
};

/** Dated sites west to east, then undated projects in stable slug order. */
export function surveyNeighbourOrder(
  projects: readonly Project[],
  sites: readonly Site[]
): SurveyNeighbour[] {
  const dated = sites.map((s) => ({
    slug: s.slug,
    name: s.name,
    ref: s.ref,
  }));
  const onSheet = new Set(dated.map((s) => s.slug));
  const undated = projects
    .filter((p) => !onSheet.has(p.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((p) => ({ slug: p.slug, name: p.name, ref: null }));
  return [...dated, ...undated];
}

export function sortForGazetteer(
  projects: readonly Project[],
  sites: readonly Site[]
): Project[] {
  const refOf = new Map(sites.map((s) => [s.slug, s]));
  return [...projects].sort((a, b) => {
    const as = refOf.get(a.slug);
    const bs = refOf.get(b.slug);
    if (as && bs) return as.x - bs.x;
    if (as) return -1;
    if (bs) return 1;
    return a.slug.localeCompare(b.slug);
  });
}
