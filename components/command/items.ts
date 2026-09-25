import { defaultFilter } from "cmdk";

import type { SearchEntry } from "./types";

export type Action = "copy-email" | "theme" | "customize" | "markdown";

/** A menu row that runs something instead of navigating. */
export type ActionItem = {
  id: string;
  title: string;
  subtitle?: string;
  group: "Actions";
  keywords: string[];
  action: Action;
};

export type Item = SearchEntry | ActionItem;

export const isAction = (item: Item): item is ActionItem => "action" in item;

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

/** The Actions group. Copy email needs the index; markdown needs a mirrored page. */
export function buildActions({
  email,
  markdownPath,
}: {
  email?: string;
  markdownPath?: string;
}): ActionItem[] {
  const actions: ActionItem[] = [];
  if (email) {
    actions.push({
      id: "action:copy-email",
      title: "Copy email",
      subtitle: email,
      group: "Actions",
      action: "copy-email",
      keywords: ["contact", "mail", "clipboard"],
    });
  }
  actions.push(
    {
      id: "action:theme",
      title: "Toggle theme",
      subtitle: "Switch between light and dark",
      group: "Actions",
      action: "theme",
      keywords: ["dark", "light", "mode", "appearance"],
    },
    {
      id: "action:customize",
      title: "Customize",
      subtitle: "Accent, reading font, motion and effects",
      group: "Actions",
      action: "customize",
      keywords: ["preferences", "settings", "accent", "font", "motion"],
    }
  );
  if (markdownPath) {
    actions.push({
      id: "action:markdown",
      title: "View as markdown",
      subtitle: markdownPath,
      group: "Actions",
      action: "markdown",
      keywords: ["md", "source", "raw", "text", "llm"],
    });
  }
  return actions;
}
