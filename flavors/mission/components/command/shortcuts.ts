import { sections } from "@/flavors/mission/content";

import {
  goKeyFor as sharedGoKeyFor,
  goSequence as sharedGoSequence,
  type KeyLike,
} from "@/lib/command/shortcuts";

/** `g` then a section's key goes to it: `g p` is Projects, `g e` Experience. */
export const goKeys: Readonly<Record<string, string>> = Object.fromEntries(
  sections.map((section) => [section.key, section.href])
);

export const goKeyFor = (href: string) => sharedGoKeyFor(href, goKeys);

export const goSequence = (
  query: string,
  startedAt: number | null,
  event: KeyLike,
  now?: number
) => sharedGoSequence(query, startedAt, event, goKeys, now);
