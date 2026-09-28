"use client";

import * as React from "react";
import { accentPresets } from "@/flavors/minimal/lib/prefs";
import { subscribePrefs, usePrefs } from "@/flavors/minimal/lib/prefs-store";

import { applyPrefs } from "./apply-prefs";
import { useHydratedFromServer } from "./server-html";

const MEDIA_QUERIES = [
  "(prefers-color-scheme: dark)",
  "(prefers-reduced-motion: reduce)",
];

/**
 * Keeps <html> in sync after hydration: preference changes (this tab or another)
 * and OS colour-scheme or reduced-motion changes. After hydration it never
 * applies on mount, because the pre-hydration script already did and
 * `usePrefs` briefly returns defaults while hydrating. A document React
 * rendered on the client had no script run, so there it applies on mount.
 */
export function PrefsSync() {
  const prefs = usePrefs();
  const latest = React.useRef(prefs);
  const fromServer = useHydratedFromServer();

  React.useEffect(() => {
    latest.current = prefs;
  }, [prefs]);

  React.useEffect(() => {
    const root = document.documentElement;
    const unsubscribe = subscribePrefs((next) =>
      applyPrefs(next, root, accentPresets)
    );

    const reapply = () => applyPrefs(latest.current, root, accentPresets);
    if (!fromServer) reapply();
    const lists = MEDIA_QUERIES.map((query) => window.matchMedia(query));
    for (const list of lists) list.addEventListener("change", reapply);

    return () => {
      unsubscribe();
      for (const list of lists) list.removeEventListener("change", reapply);
    };
  }, [fromServer]);

  return null;
}
