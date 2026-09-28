"use client";

import { applyPrefs } from "@/flavors/surface/lib/prefs";
import { subscribePrefs, usePrefs } from "@/flavors/surface/lib/prefs-store";

import { usePrefsSync } from "@/components/semantic/prefs/use-prefs-sync";

/** Mirrors preferences onto <html> after hydration. */
export function PrefsSync() {
  usePrefsSync(usePrefs(), subscribePrefs, (prefs) =>
    applyPrefs(prefs, document.documentElement)
  );
  return null;
}
