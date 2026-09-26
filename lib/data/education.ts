import type { EDUCATION_QUERY_RESULT } from "@/sanity.types";

import { normalizeName } from "@/lib/normalize";

import { optional, toDomainId } from "./shared";
import type { Education } from "./types";

export function mapEducation(
  result: EDUCATION_QUERY_RESULT[number]
): Education {
  return {
    id: toDomainId(result._id, "education"),
    institution: result.institution ?? "",
    degree: result.degree ?? "",
    location: result.location ?? "",
    startYear: optional(result.startYear),
    endYear: result.endYear ?? 0,
    score: optional(result.score),
  };
}

export type EducationGroup = {
  institution: string;
  location: string;
  entries: Education[];
};

/**
 * Collects qualifications from the same school under one heading so the
 * school name and location render once. Groups appear where the school first
 * does, and entries keep their original order; the first entry's location
 * names the group.
 */
export function groupEducation(items: readonly Education[]): EducationGroup[] {
  const groups = new Map<string, EducationGroup>();
  for (const item of items) {
    const key = normalizeName(item.institution);
    const group = groups.get(key);
    if (group) {
      group.entries.push(item);
    } else {
      groups.set(key, {
        institution: item.institution,
        location: item.location,
        entries: [item],
      });
    }
  }
  return [...groups.values()];
}
