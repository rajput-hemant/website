/*
 * Shared entrance timing for SplitHeading, Reveal and Dimension. No gsap here:
 * these run on first paint, so anything heavy is imported only when needed.
 */

let hydratedAt = 0;

/** Whether this mount follows a client navigation rather than the initial hydration. */
export function mountedByNavigation(): boolean {
  const now = performance.now();
  if (hydratedAt === 0) hydratedAt = now;
  return now - hydratedAt > 800;
}

export function motionOn(): boolean {
  return document.documentElement.dataset.motion === "on";
}

export function belowFold(el: Element): boolean {
  return el.getBoundingClientRect().top > window.innerHeight;
}

/** Calls `onEnter` once, the first time `el` intersects the (margin-adjusted) viewport. */
export function observeOnce(
  el: Element,
  onEnter: () => void,
  rootMargin = "0px 0px -15% 0px"
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      onEnter();
    },
    { rootMargin }
  );
  observer.observe(el);
  return () => observer.disconnect();
}
