"use client";

import * as React from "react";
import { InteractionLayer } from "@/flavors/drawing-set/components/interaction/interaction-layer";
import { LinkPreviewLayer } from "@/flavors/drawing-set/components/link-preview/link-preview-layer";
import { usePrefs } from "@/flavors/drawing-set/lib/prefs-store";

import { ClickSound } from "@/components/semantic/click-sound";
import { SmoothScroll } from "@/components/semantic/motion/smooth-scroll";

/** Everything the page can live without on first paint: Lenis on the GSAP ticker, pointer effects and the cursor, sound, link previews. */
export function DeferredLayers() {
  const { sound } = usePrefs();
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/drawing-set/components/command/command-dialog");
  }, []);

  return (
    <>
      <SmoothScroll />
      <InteractionLayer />
      <ClickSound enabled={sound} />
      <LinkPreviewLayer />
    </>
  );
}
