import type { PROJECTS_QUERY_RESULT } from "@/sanity.types";

import { urlForImage } from "@/sanity/lib/image";

import { optional, toDomainId, toRichText } from "./shared";
import type { Image, Project } from "./types";

type ProjectImageResult = PROJECTS_QUERY_RESULT[number]["image"];

function mapProjectImage(image: ProjectImageResult): Image | undefined {
  const asset = image?.asset;
  const dimensions = asset?.metadata?.dimensions;
  if (!image || !asset || !dimensions?.width || !dimensions.height) {
    return undefined;
  }

  const crop = image.crop;
  const visibleWidth = 1 - (crop?.left ?? 0) - (crop?.right ?? 0);
  const visibleHeight = 1 - (crop?.top ?? 0) - (crop?.bottom ?? 0);
  const lqip = asset.metadata?.lqip;

  return {
    url: urlForImage({
      asset: { _id: asset._id },
      crop: crop ?? undefined,
      hotspot: image.hotspot ?? undefined,
    }).url(),
    alt: image.alt ?? "",
    width: Math.round(dimensions.width * visibleWidth),
    height: Math.round(dimensions.height * visibleHeight),
    ...(lqip ? { blurDataUrl: lqip } : {}),
  };
}

export function mapProject(result: PROJECTS_QUERY_RESULT[number]): Project {
  return {
    id: toDomainId(result._id, "project"),
    slug: result.slug ?? toDomainId(result._id, "project"),
    name: result.name ?? "",
    tagline: result.tagline ?? "",
    description: toRichText(result.description),
    image: mapProjectImage(result.image),
    stack: result.stack ?? [],
    github: optional(result.github),
    live: optional(result.live),
    featured: result.featured ?? false,
    status: result.status ?? "active",
    year: result.year ?? null,
  };
}

/** Featured first; otherwise keeps the incoming order (the query's `order`, or the fallback's array order). */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
}
