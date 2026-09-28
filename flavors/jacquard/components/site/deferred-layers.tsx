"use client";

import * as React from "react";
import { LinkPreviewLayer } from "@/flavors/jacquard/components/link-preview/link-preview-layer";
import { usePrefs } from "@/flavors/jacquard/lib/prefs-store";
import { onToggle, voiceFor } from "@/flavors/jacquard/lib/sound/voices";

import { ClickSound } from "@/components/semantic/click-sound";
import { SmoothScroll } from "@/components/semantic/motion/smooth-scroll";

/** Everything the page can live without on first paint: Lenis, loom sounds and link previews. */
export function DeferredLayers() {
  const { sound } = usePrefs();
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/jacquard/components/command/command-dialog");
  }, []);
  return (
    <>
      <SmoothScroll />
      <ClickSound enabled={sound} voiceFor={voiceFor} onToggle={onToggle} />
      <LinkPreviewLayer />
    </>
  );
}
