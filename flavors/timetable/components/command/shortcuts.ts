import { platforms } from "@/flavors/timetable/content";

import {
  GO_SEQUENCE_MS,
  goKeyFor as sharedGoKeyFor,
  goSequence as sharedGoSequence,
  type KeyLike,
} from "@/lib/command/shortcuts";

/** `g` then a platform number goes to that platform: `g 1` is Projects. */
export const goKeys: Readonly<Record<string, string>> = Object.fromEntries(
  platforms.map((p) => [p.platform, p.href])
);

export { GO_SEQUENCE_MS };

export const goKeyFor = (href: string) => sharedGoKeyFor(href, goKeys);

/** `g` then a platform number typed into the menu's empty search field. */
export const goSequence = (
  query: string,
  startedAt: number | null,
  event: KeyLike,
  now?: number
) => sharedGoSequence(query, startedAt, event, goKeys, now);
