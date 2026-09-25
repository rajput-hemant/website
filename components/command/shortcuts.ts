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
