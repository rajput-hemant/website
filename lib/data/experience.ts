import type { EXPERIENCE_QUERY_RESULT } from "@/sanity.types";

import { optional, toDomainId, toRichText } from "./shared";
import type { Experience } from "./types";

type ExperienceResult = EXPERIENCE_QUERY_RESULT[number];

export function mapExperience(result: ExperienceResult): Experience {
  const successor = result.continuedInto;
  return {
    id: toDomainId(result._id, "experience"),
    company: result.company ?? "",
    companyUrl: optional(result.companyUrl),
    companyBlurb: optional(result.companyBlurb),
    title: result.title ?? "",
    location: result.location ?? "",
    remote: result.remote ?? false,
    employmentType: result.employmentType ?? "full-time",
    employmentNote: optional(result.employmentNote),
    startDate: result.startDate ?? "",
    endDate: optional(result.endDate),
    endNote: optional(result.endNote),
    continuedInto: successor
      ? {
          id: toDomainId(successor._id, "experience"),
          company: successor.company ?? "",
          note: optional(result.continuationNote),
        }
      : undefined,
    body: toRichText(result.body),
    highlights: result.highlights ?? [],
  };
}

/**
 * Sorts roles newest first and derives `continuedFrom` on each successor from
 * its predecessor's `continuedInto`, so continuity is stored in one place only.
 */
export function linkContinuations(roles: Experience[]): Experience[] {
  const predecessorBySuccessorId = new Map<string, Experience>();
  for (const role of roles) {
    if (role.continuedInto) {
      predecessorBySuccessorId.set(role.continuedInto.id, role);
    }
  }

  return roles
    .map(({ continuedFrom: _stored, ...role }) => {
      const predecessor = predecessorBySuccessorId.get(role.id);
      if (!predecessor) return role;
      return {
        ...role,
        continuedFrom: {
          id: predecessor.id,
          company: predecessor.company,
          note: predecessor.continuedInto?.note,
        },
      };
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}
