/** `g` then one of these keys navigates to the page. */
export const goKeys = {
  h: "/",
  w: "/work",
  p: "/projects",
  n: "/now",
  c: "/changelog",
  a: "/ask",
  l: "/lab",
} as const satisfies Record<string, string>;

/** The second key of the `g` sequence that leads to `href`, if any. */
export function goKeyFor(href: string): string | undefined {
  return Object.entries(goKeys).find(([, path]) => path === href)?.[0];
}

/** How long after `g` the second key still counts as part of the jump. */
export const GO_SEQUENCE_MS = 1000;

type KeyLike = Pick<
  KeyboardEvent,
  "key" | "altKey" | "ctrlKey" | "metaKey" | "isComposing"
>;

/**
 * Inside the menu's search field, `g` then a page key jumps just as it does
 * on the page, but only when `g` was typed into an empty field moments ago.
 * Any other typing, including longer words that start with `g`, searches.
 */
export function goSequence(
  query: string,
  startedAt: number | null,
  event: KeyLike,
  now = Date.now()
): string | undefined {
  if (query !== "g" || startedAt === null) return undefined;
  if (now - startedAt > GO_SEQUENCE_MS) return undefined;
  if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey)
    return undefined;
  return goKeys[event.key.toLowerCase() as keyof typeof goKeys];
}
