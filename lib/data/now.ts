import type { NOW_QUERY_RESULT } from "@/sanity.types";

import { safeHref } from "@/lib/safe-href";

import type { Now } from "./types";

export function mapNow(result: NonNullable<NOW_QUERY_RESULT>): Now {
  return {
    items: (result.items ?? []).flatMap(({ text, link }) =>
      text ? [{ text, link: safeHref(link) }] : []
    ),
    updatedAt: result.updatedAt ?? "",
  };
}
