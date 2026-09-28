import type { SKILLS_QUERY_RESULT } from "@/sanity.types";

import { toDomainId } from "./shared";
import type { SkillGroup } from "./types";

export function mapSkillGroup(result: SKILLS_QUERY_RESULT[number]): SkillGroup {
  return {
    id: toDomainId(result._id, "skillGroup"),
    title: result.title ?? "",
    items: result.items ?? [],
  };
}
