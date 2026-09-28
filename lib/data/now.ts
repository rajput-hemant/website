import type { NOW_QUERY_RESULT } from "@/sanity.types";

import { optional } from "./shared";
import type { Now } from "./types";

export function mapNow(result: NonNullable<NOW_QUERY_RESULT>): Now {
  return {
    items: (result.items ?? []).flatMap(({ text, link }) =>
      text ? [{ text, link: optional(link) }] : []
    ),
    updatedAt: result.updatedAt ?? "",
  };
}
