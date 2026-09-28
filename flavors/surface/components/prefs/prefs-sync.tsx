"use client";

import * as React from "react";
import { KeySounds } from "@/flavors/surface/components/site/key-sounds";
import { applyPrefs } from "@/flavors/surface/lib/prefs";
import { subscribePrefs, usePrefs } from "@/flavors/surface/lib/prefs-store";
import { voiceFor } from "@/flavors/surface/lib/sound/voices";

import { suspendSound } from "@/lib/sound";
import { ClickSound } from "@/components/semantic/click-sound";
import { usePrefsSync } from "@/components/semantic/prefs/use-prefs-sync";
import { TouchHaptics } from "@/components/semantic/touch-haptics";

/**
 * Mirrors preferences onto <html> after hydration, mounts the click and key
 * sounds while sound is on, and hosts touch haptics.
 */
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

  return (
    <>
      <ClickSound enabled={prefs.sound} voiceFor={voiceFor} />
      <KeySounds enabled={prefs.sound} />
      <TouchHaptics enabled={prefs.haptics} />
    </>
  );
}
