"use client";

import * as React from "react";
import { applyPrefs } from "@/flavors/surface/lib/prefs";
import { subscribePrefs, usePrefs } from "@/flavors/surface/lib/prefs-store";

import { suspendSound } from "@/lib/sound";
import { usePrefsSync } from "@/components/semantic/prefs/use-prefs-sync";
import { TouchHaptics } from "@/components/semantic/touch-haptics";

/** Mirrors preferences onto <html> after hydration, and hosts touch haptics. */
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

  return <TouchHaptics enabled={prefs.haptics} />;
}
