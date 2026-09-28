/**
 * Which way a route change moves through the site's hierarchy: deeper
 * (`/lab` → `/lab/signature-field`) is forward, shallower is back, and a move
 * between siblings (`/work` → `/projects`) has no direction.
 */
export type NavigationDirection = "forward" | "back" | "none";

/** Transition types a `<Link transitionTypes>` can pass to force a direction. */
export const NAV_FORWARD = "nav-forward";
export const NAV_BACK = "nav-back";

function segments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

export function navigationDirection(
  from: string,
  to: string
): NavigationDirection {
  const fromDepth = segments(from).length;
  const toDepth = segments(to).length;
  if (toDepth > fromDepth) return "forward";
  if (toDepth < fromDepth) return "back";
  return "none";
}
