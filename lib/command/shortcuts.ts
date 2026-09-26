import type { Route } from "next";

/** How long after `g` the second key still counts as part of the jump. */
export const GO_SEQUENCE_MS = 1000;

export type KeyLike = Pick<
  KeyboardEvent,
  "key" | "altKey" | "ctrlKey" | "metaKey" | "isComposing"
>;

/** The second key of the `g` sequence that leads to `href` in `keys`, if any. */
export function goKeyFor(
  href: string,
  keys: Readonly<Record<string, Route>>
): string | undefined {
  return Object.entries(keys).find(([, path]) => path === href)?.[0];
}

/**
 * Inside the menu's search field, `g` then a page key jumps just as it does
 * on the page, but only when `g` was typed into an empty field moments ago.
 * Any other typing, including longer words that start with `g`, searches.
 */
export function goSequence(
  query: string,
  startedAt: number | null,
  event: KeyLike,
  keys: Readonly<Record<string, Route>>,
  now = Date.now()
): Route | undefined {
  if (query !== "g" || startedAt === null) return undefined;
  if (now - startedAt > GO_SEQUENCE_MS) return undefined;
  if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) {
    return undefined;
  }
  const key = event.key.toLowerCase();
  return Object.hasOwn(keys, key) ? keys[key] : undefined;
}
