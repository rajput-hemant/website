"use client";

import { applyPrefs } from "@/flavors/survey/lib/prefs";
import { subscribePrefs, usePrefs } from "@/flavors/survey/lib/prefs-store";

import { usePrefsSync } from "@/components/semantic/prefs/use-prefs-sync";

/** Mirrors preferences onto <html> after hydration; the pre-paint script did the first paint. */
export function PrefsSync() {
  usePrefsSync(usePrefs(), subscribePrefs, (prefs) =>
    applyPrefs(prefs, document.documentElement)
  );
  return null;
}
