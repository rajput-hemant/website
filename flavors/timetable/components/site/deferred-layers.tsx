"use client";

import * as React from "react";
import { InteractionLayer } from "@/flavors/timetable/components/interaction/interaction-layer";
import { LinkPreviewLayer } from "@/flavors/timetable/components/link-preview/link-preview-layer";
import { FlapRiffle } from "@/flavors/timetable/components/motion/flap-riffle";
import { usePrefs } from "@/flavors/timetable/lib/prefs-store";

import { ClickSound } from "@/components/semantic/click-sound";
import { SmoothScroll } from "@/components/semantic/motion/smooth-scroll";

/** Everything the page can live without on first paint: Lenis on the GSAP ticker, pointer effects, sound, link previews, flap riffles. */
export function DeferredLayers() {
  const { sound } = usePrefs();
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/timetable/components/command/command-dialog");
  }, []);

  return (
    <>
      <SmoothScroll />
      <InteractionLayer />
      <ClickSound enabled={sound} />
      <LinkPreviewLayer />
      <FlapRiffle />
    </>
  );
}
