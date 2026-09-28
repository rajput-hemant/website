"use client";

import * as React from "react";
import { InteractionLayer } from "@/flavors/survey/components/interaction/interaction-layer";
import { LinkPreviewLayer } from "@/flavors/survey/components/link-preview";
import { DrawReveal } from "@/flavors/survey/components/motion/draw-reveal";
import { usePrefs } from "@/flavors/survey/lib/prefs-store";
import { voiceFor } from "@/flavors/survey/lib/sound/voices";

import { ClickSound } from "@/components/semantic/click-sound";
import { SmoothScroll } from "@/components/semantic/motion/smooth-scroll";
import { TouchHaptics } from "@/components/semantic/touch-haptics";

/** Everything the page can live without on first paint: Lenis, the reticle, sound, link previews, contour drawing. */
export function DeferredLayers() {
  const { sound, haptics } = usePrefs();
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/survey/components/command/command-dialog");
  }, []);

  return (
    <>
      <SmoothScroll />
      <InteractionLayer />
      <ClickSound enabled={sound} voiceFor={voiceFor} />
      <TouchHaptics enabled={haptics} />
      <LinkPreviewLayer />
      <DrawReveal />
    </>
  );
}
