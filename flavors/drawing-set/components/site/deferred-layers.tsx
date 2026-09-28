"use client";

import * as React from "react";
import { ClickSound } from "@/flavors/drawing-set/components/customize/click-sound";
import { InteractionLayer } from "@/flavors/drawing-set/components/interaction/interaction-layer";
import { LinkPreviewLayer } from "@/flavors/drawing-set/components/link-preview/link-preview-layer";
import { SmoothScroll } from "@/flavors/drawing-set/components/motion/smooth-scroll";

/** Everything the page can live without on first paint: Lenis on the GSAP ticker, pointer effects and the cursor, sound, link previews. */
export function DeferredLayers() {
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/drawing-set/components/command/command-dialog");
  }, []);

  return (
    <>
      <SmoothScroll />
      <InteractionLayer />
      <ClickSound />
      <LinkPreviewLayer />
    </>
  );
}
