import type Lenis from "lenis";

/**
 * The one scroll source. Scene code reads `scroll` (updated by Lenis or native
 * scroll) instead of touching window.scrollY in a frame loop.
 */
export const scroll = { y: 0, velocity: 0, progress: 0 };

let lenis: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  lenis = next;
}

export function getLenis(): Lenis | null {
  return lenis;
}

/** Scrolls smoothly when Lenis runs, natively (respecting motion) otherwise. */
export function scrollToTarget(target: number | HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target);
    return;
  }
  const top =
    typeof target === "number"
      ? target
      : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top });
}
