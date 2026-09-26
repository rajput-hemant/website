import {
  goKeyFor as sharedGoKeyFor,
  goSequence as sharedGoSequence,
  type KeyLike,
} from "@/lib/command/shortcuts";

export { GO_SEQUENCE_MS } from "@/lib/command/shortcuts";

/** `g` then one of these keys navigates to the page. */
export const goKeys = {
  h: "/",
  p: "/projects",
  e: "/work",
  l: "/lab",
  a: "/about",
  n: "/now",
} as const satisfies Record<string, string>;

/** The second key of the `g` sequence that leads to `href`, if any. */
export function goKeyFor(href: string): string | undefined {
  return sharedGoKeyFor(href, goKeys);
}

/** `g` then a page key typed into an empty search field jumps to that page. */
export function goSequence(
  query: string,
  startedAt: number | null,
  event: KeyLike,
  now?: number
): string | undefined {
  return sharedGoSequence(query, startedAt, event, goKeys, now);
}
