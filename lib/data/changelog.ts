import type { CHANGELOG_QUERY_RESULT } from "@/sanity.types";

import { safeHref } from "@/lib/safe-href";

import { toDomainId } from "./shared";
import type { Update } from "./types";

export function mapUpdate(result: CHANGELOG_QUERY_RESULT[number]): Update {
  return {
    id: toDomainId(result._id, "update"),
    date: result.date ?? "",
    text: result.text ?? "",
    category: result.category ?? "site",
    link: safeHref(result.link),
  };
}

export function sortChangelog(updates: Update[]): Update[] {
  return [...updates].sort((a, b) => b.date.localeCompare(a.date));
}
