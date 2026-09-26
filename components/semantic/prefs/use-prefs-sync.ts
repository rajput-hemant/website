"use client";

import * as React from "react";

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
 * so there it does.
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
    const unsubscribe = subscribePrefs((next) => applyRef.current(next));
    const reapply = () => applyRef.current(latest.current);
    if (!fromServer) reapply();
    const lists = MEDIA_QUERIES.map((query) => window.matchMedia(query));
    for (const list of lists) list.addEventListener("change", reapply);
    return () => {
      unsubscribe();
      for (const list of lists) list.removeEventListener("change", reapply);
    };
  }, [subscribePrefs, fromServer]);
}
