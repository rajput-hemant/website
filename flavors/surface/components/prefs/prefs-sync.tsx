"use client";

import * as React from "react";
import { applyPrefs } from "@/flavors/surface/lib/prefs";
import { subscribePrefs, usePrefs } from "@/flavors/surface/lib/prefs-store";

import { usePrefsSync } from "@/components/semantic/prefs/use-prefs-sync";
import { suspendSound } from "@/lib/sound";

/** Mirrors preferences onto <html> after hydration. */
export function PrefsSync() {
  const prefs = usePrefs();

  usePrefsSync(prefs, subscribePrefs, (next) => {
    applyPrefs(next, document.documentElement);
    if (!next.sound) suspendSound();
  });

  React.useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) suspendSound();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return null;
}
