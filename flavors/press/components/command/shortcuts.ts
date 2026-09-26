import { sheets } from "@/flavors/press/content";

import {
  goKeyFor as sharedGoKeyFor,
  goSequence as sharedGoSequence,
  type KeyLike,
} from "@/lib/command/shortcuts";

/** `g` then a sheet number goes to that sheet: `g 2` is Projects. */
export const goKeys: Readonly<Record<string, string>> = Object.fromEntries(
  sheets.map((s) => [String(s.n), s.href])
);

export const goKeyFor = (href: string) => sharedGoKeyFor(href, goKeys);

export const goSequence = (
  query: string,
  startedAt: number | null,
  event: KeyLike,
  now?: number
) => sharedGoSequence(query, startedAt, event, goKeys, now);
