import { places } from "@/flavors/survey/content";

import {
  GO_SEQUENCE_MS,
  goKeyFor as sharedGoKeyFor,
  goSequence as sharedGoSequence,
  type KeyLike,
} from "@/lib/command/shortcuts";

/** `g` then a page's letter goes there: `g p` is Projects. */
export const goKeys: Readonly<Record<string, string>> = Object.fromEntries(
  places.map((p) => [p.key, p.href])
);

export { GO_SEQUENCE_MS };

export const goKeyFor = (href: string) => sharedGoKeyFor(href, goKeys);

/** `g` then a page's letter typed into the menu's empty search field. */
export const goSequence = (
  query: string,
  startedAt: number | null,
  event: KeyLike,
  now?: number
) => sharedGoSequence(query, startedAt, event, goKeys, now);
