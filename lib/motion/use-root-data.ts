"use client";

import * as React from "react";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true });
  return () => observer.disconnect();
}

/**
 * A `data-*` flag on <html> (set by the pre-paint script and PrefsSync), live.
 * Returns `fallback` during SSR and hydration.
 */
export function useRootData(key: string, fallback = ""): string {
  return React.useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset[key] ?? fallback,
    () => fallback
  );
}

export const useMotionOn = () => useRootData("motion", "on") === "on";
