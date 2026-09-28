"use client";

import { accentPresets, applyPrefs } from "@/flavors/drawing-set/lib/prefs";
import {
  subscribePrefs,
  usePrefs,
} from "@/flavors/drawing-set/lib/prefs-store";

import { usePrefsSync } from "@/components/semantic/prefs/use-prefs-sync";

/** Mirrors preferences onto <html> after hydration. */
export function PrefsSync() {
  usePrefsSync(usePrefs(), subscribePrefs, (prefs) =>
    applyPrefs(prefs, document.documentElement, accentPresets)
  );
  return null;
}
