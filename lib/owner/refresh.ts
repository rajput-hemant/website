import "server-only";

import { revalidateTag } from "next/cache";

import { sanityTags } from "@/sanity/lib/fetch";

/**
 * Expires every Sanity cache tag. Stale content is never served (`expire: 0`),
 * so the next request to each static page regenerates it from the dataset.
 */
export function expireAllSanityTags(): readonly string[] {
  for (const tag of sanityTags) revalidateTag(tag, { expire: 0 });
  return sanityTags;
}
