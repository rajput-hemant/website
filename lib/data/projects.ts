import type { PROJECTS_QUERY_RESULT } from "@/sanity.types";

import { optional, toDomainId, toRichText } from "./shared";
import type { Project } from "./types";

export function mapProject(result: PROJECTS_QUERY_RESULT[number]): Project {
  return {
    id: toDomainId(result._id, "project"),
    slug: result.slug ?? toDomainId(result._id, "project"),
    name: result.name ?? "",
    tagline: result.tagline ?? "",
    description: toRichText(result.description),
    stack: result.stack ?? [],
    github: optional(result.github),
    live: optional(result.live),
    featured: result.featured ?? false,
    status: result.status ?? "active",
    year: result.year ?? 0,
  };
}

/** Featured first; otherwise keeps the incoming order (the query's `order`, or the fallback's array order). */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
}
