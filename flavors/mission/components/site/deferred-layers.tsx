"use client";

import * as React from "react";
import { LinkPreviewLayer } from "@/flavors/mission/components/link-preview/link-preview-layer";
import { usePrefs } from "@/flavors/mission/lib/prefs-store";
import { onToggle, voiceFor } from "@/flavors/mission/lib/sound/voices";

import { ClickSound } from "@/components/semantic/click-sound";
import { SmoothScroll } from "@/components/semantic/motion/smooth-scroll";
import { TouchHaptics } from "@/components/semantic/touch-haptics";

/** Everything the page can live without on first paint: Lenis, console sounds and link previews. */
export function DeferredLayers() {
  const { sound, haptics } = usePrefs();
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/mission/components/command/command-dialog");
  }, []);
  return (
    <>
      <SmoothScroll />
      <ClickSound enabled={sound} voiceFor={voiceFor} onToggle={onToggle} />
      <TouchHaptics enabled={haptics} />
      <LinkPreviewLayer />
    </>
  );
}
