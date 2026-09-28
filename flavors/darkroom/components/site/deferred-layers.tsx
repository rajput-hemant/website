"use client";

import * as React from "react";
import { LinkPreviewLayer } from "@/flavors/darkroom/components/link-preview/link-preview-layer";
import { SheetLayer } from "@/flavors/darkroom/components/sheet/sheet-layer";
import { usePrefs } from "@/flavors/darkroom/lib/prefs-store";
import { onToggle, voiceFor } from "@/flavors/darkroom/lib/sound/voices";

import { ClickSound } from "@/components/semantic/click-sound";
import { TouchHaptics } from "@/components/semantic/touch-haptics";

/** Everything the page can live without on first paint: developing frames and grease marks, sound, link previews. */
export function DeferredLayers() {
  const { sound, haptics } = usePrefs();
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/darkroom/components/command/command-dialog");
  }, []);
  return (
    <>
      <SheetLayer />
      <ClickSound enabled={sound} voiceFor={voiceFor} onToggle={onToggle} />
      <TouchHaptics enabled={haptics} />
      <LinkPreviewLayer />
    </>
  );
}
