"use client";

import { useEffect, useRef } from "react";

import { accentPresets } from "@/lib/prefs";
import { subscribePrefs, usePrefs } from "@/lib/prefs-store";

import { applyPrefs } from "./apply-prefs";

const MEDIA_QUERIES = [
  "(prefers-color-scheme: dark)",
  "(prefers-reduced-motion: reduce)",
];

/**
 * Keeps <html> in sync after hydration: preference changes (this tab or another)
 * and OS colour-scheme or reduced-motion changes. It never applies on mount,
 * because the pre-hydration script already did and `usePrefs` briefly returns
 * defaults while hydrating.
 */
export function PrefsSync() {
  const prefs = usePrefs();
  const latest = useRef(prefs);

  useEffect(() => {
    latest.current = prefs;
  }, [prefs]);

  useEffect(() => {
    const root = document.documentElement;
    const unsubscribe = subscribePrefs((next) =>
      applyPrefs(next, root, accentPresets)
    );

    const reapply = () => applyPrefs(latest.current, root, accentPresets);
    const lists = MEDIA_QUERIES.map((query) => window.matchMedia(query));
    for (const list of lists) list.addEventListener("change", reapply);

    return () => {
      unsubscribe();
      for (const list of lists) list.removeEventListener("change", reapply);
    };
  }, []);

  return null;
}
