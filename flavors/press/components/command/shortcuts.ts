import type { Route } from "next";
import { sheets } from "@/flavors/press/content";

import {
  goKeyFor as sharedGoKeyFor,
  goSequence as sharedGoSequence,
  type KeyLike,
} from "@/lib/command/shortcuts";
import { route } from "@/lib/route";

/** `g` then a sheet number goes to that sheet: `g 2` is Projects. */
export const goKeys: Readonly<Record<string, Route>> = Object.fromEntries(
  sheets.map((s) => [String(s.n), route(s.href)])
);

export const goKeyFor = (href: string) => sharedGoKeyFor(href, goKeys);

export const goSequence = (
  query: string,
  startedAt: number | null,
  event: KeyLike,
  now?: number
) => sharedGoSequence(query, startedAt, event, goKeys, now);
