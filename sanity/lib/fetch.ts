import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";

import { client } from "./client";
import { readToken } from "./token";

/** One cache tag per document type; the revalidate webhook maps `_type` to it. */
export const sanityTags = [
  "profile",
  "experience",
  "project",
  "now",
  "update",
  "skillGroup",
  "education",
  "question",
] as const;

export type SanityTag = (typeof sanityTags)[number];

export function isSanityTag(value: unknown): value is SanityTag {
  return sanityTags.includes(value as SanityTag);
}

/** `draftMode()` throws outside a request (generateStaticParams, scripts); treat that as published. */
async function isDraftModeEnabled(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

/**
 * Published reads are cached indefinitely under their type tags, so pages stay
 * static until the webhook (or the owner's refresh) calls `revalidateTag`.
 * Draft mode bypasses the cache and reads drafts with the viewer token.
 *
 * These reads skip Sanity's API CDN (`useCdn: false`): they only run when a
 * page is built or regenerated, and right after a tag is expired the CDN can
 * still hand back the pre-mutation document, which re-caches stale content
 * until the next invalidation (the "hidden comment still shows" bug).
 */
export async function sanityFetch<Result>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: QueryParams;
  tags: SanityTag[];
}): Promise<Result> {
  if (await isDraftModeEnabled()) {
    if (!readToken) {
      throw new Error(
        "Draft mode needs SANITY_API_READ_TOKEN. See docs/sanity.md."
      );
    }
    return client.fetch<Result>(query, params, {
      perspective: "drafts",
      useCdn: false,
      stega: false,
      token: readToken,
      cache: "no-store",
    });
  }

  return client.fetch<Result>(query, params, {
    ...(readToken !== undefined && { token: readToken }),
    useCdn: false,
    cache: "force-cache",
    next: { tags },
  });
}
