import { defaultFilter } from "cmdk";

import type { SearchEntry } from "./types";

/** A menu row that runs something instead of navigating. Each edition names its own actions. */
export type ActionItem<A extends string = string> = {
  id: string;
  title: string;
  subtitle?: string;
  group: "Actions";
  keywords: string[];
  action: A;
  /** The option matching the current preference: shown as checked. */
  active?: boolean;
};

export type Item<A extends string = string> = SearchEntry | ActionItem<A>;

export const isAction = <A extends string = string>(
  item: Item<A>
): item is ActionItem<A> => "action" in item;

/** cmdk's title scores below this are letters scattered across a long title. */
const MIN_TITLE_SCORE = 0.16;
/** A literal hit in a subtitle or keyword ranks under a good title match. */
const KEYWORD_SCORE = 0.4;

/** What cmdk matches an item against, title first so `filter` can score it on its own. */
export function keywordsFor(item: Item): string[] {
  return [item.title, item.subtitle ?? "", item.group, ...item.keywords];
}

/**
 * cmdk's fuzzy score on the title (the first keyword), or a flat score when
 * every word of the query appears verbatim in the rest. Fuzzy-matching the
 * long subtitle and keyword text would match almost any short query.
 */
export function filter(
  value: string,
  search: string,
  keywords: string[] = []
): number {
  const [title = value, ...rest] = keywords;
  const titleScore = defaultFilter(title, search);
  if (titleScore >= MIN_TITLE_SCORE) return titleScore;
  const haystack = rest.join(" ").toLowerCase();
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((word) => haystack.includes(word))
    ? KEYWORD_SCORE
    : 0;
}
