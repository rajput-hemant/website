"use client";

import { accentPresets } from "@/flavors/minimal/lib/prefs";
import { subscribePrefs, usePrefs } from "@/flavors/minimal/lib/prefs-store";

import { usePrefsSync } from "@/components/semantic/prefs/use-prefs-sync";

import { applyPrefs } from "./apply-prefs";

/** Mirrors preferences onto <html> after hydration. */
export function PrefsSync() {
  usePrefsSync(usePrefs(), subscribePrefs, (prefs) =>
    applyPrefs(prefs, document.documentElement, accentPresets)
  );
  return null;
}
