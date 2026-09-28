import { pages } from "@/flavors/maquette/content";

import {
  goKeyFor as sharedGoKeyFor,
  goSequence as sharedGoSequence,
  type KeyLike,
} from "@/lib/command/shortcuts";

/** `g` then a page number goes to that page: `g 1` is Projects, `g h` is home. */
export const goKeys: Readonly<Record<string, string>> = Object.fromEntries(
  pages.map((page) => [page.key, page.href])
);

export const goKeyFor = (href: string) => sharedGoKeyFor(href, goKeys);

export const goSequence = (
  query: string,
  startedAt: number | null,
  event: KeyLike,
  now?: number
) => sharedGoSequence(query, startedAt, event, goKeys, now);
