"use client";

import * as React from "react";

import { syncThemeColor } from "@/lib/prefs/theme-color";

import { useHydratedFromServer } from "./server-html";

const MEDIA_QUERIES = [
  "(prefers-color-scheme: dark)",
  "(prefers-reduced-motion: reduce)",
];

/**
 * Keeps <html> in sync after hydration: preference changes (this tab or
 * another) and OS colour-scheme or reduced-motion changes re-run `apply`.
 * After hydration it never applies on mount, because the pre-paint script
 * already did; a document React rendered on the client had no script run,
 * so there it does. Every apply also points `theme-color` at the result.
 */
export function usePrefsSync<P>(
  prefs: P,
  subscribePrefs: (listener: (prefs: P) => void) => () => void,
  apply: (prefs: P) => void
) {
  const fromServer = useHydratedFromServer();
  const latest = React.useRef(prefs);
  const applyRef = React.useRef(apply);

  React.useEffect(() => {
    latest.current = prefs;
    applyRef.current = apply;
  });

  React.useEffect(() => {
    const run = (next: P) => {
      applyRef.current(next);
      syncThemeColor();
    };
    const unsubscribe = subscribePrefs(run);
    const reapply = () => run(latest.current);
    // The pre-paint script set data-theme; the chrome colour follows it here.
    if (fromServer) syncThemeColor();
    else reapply();
    const lists = MEDIA_QUERIES.map((query) => window.matchMedia(query));
    for (const list of lists) list.addEventListener("change", reapply);
    return () => {
      unsubscribe();
      for (const list of lists) list.removeEventListener("change", reapply);
    };
  }, [subscribePrefs, fromServer]);
}
