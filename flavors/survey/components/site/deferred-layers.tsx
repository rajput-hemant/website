"use client";

import * as React from "react";
import { InteractionLayer } from "@/flavors/survey/components/interaction/interaction-layer";
import { LinkPreviewLayer } from "@/flavors/survey/components/link-preview";
import { DrawReveal } from "@/flavors/survey/components/motion/draw-reveal";
import { usePrefs } from "@/flavors/survey/lib/prefs-store";

import { ClickSound } from "@/components/semantic/click-sound";
import { SmoothScroll } from "@/components/semantic/motion/smooth-scroll";

/** Everything the page can live without on first paint: Lenis, the reticle, sound, link previews, contour drawing. */
export function DeferredLayers() {
  const { sound } = usePrefs();
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/survey/components/command/command-dialog");
  }, []);

  return (
    <>
      <SmoothScroll />
      <InteractionLayer />
      <ClickSound enabled={sound} />
      <LinkPreviewLayer />
      <DrawReveal />
    </>
  );
}
