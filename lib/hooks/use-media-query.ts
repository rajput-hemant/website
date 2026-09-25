"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Live result of a CSS media query. `false` during SSR and hydration. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

/** Mouse or trackpad: the only pointers that get the cursor follower, smooth scroll and sound. */
export const useFinePointer = () =>
  useMediaQuery("(pointer: fine) and (hover: hover)");
