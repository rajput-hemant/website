import type { EDUCATION_QUERY_RESULT } from "@/sanity.types";

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
