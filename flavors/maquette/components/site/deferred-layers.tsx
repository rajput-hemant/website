"use client";

import * as React from "react";
import { LinkPreviewLayer } from "@/flavors/maquette/components/link-preview/link-preview-layer";
import { usePrefs } from "@/flavors/maquette/lib/prefs-store";
import { onToggle, voiceFor } from "@/flavors/maquette/lib/sound/voices";

import { ClickSound } from "@/components/semantic/click-sound";
import { TouchHaptics } from "@/components/semantic/touch-haptics";

/** Everything the page can live without on first paint: sound, haptics, link previews. */
export function DeferredLayers() {
  const { sound, haptics } = usePrefs();
  React.useEffect(() => {
    // Warms the ⌘K dialog so the first press opens it without a fetch.
    void import("@/flavors/maquette/components/command/command-dialog");
  }, []);
  return (
    <>
      <ClickSound enabled={sound} voiceFor={voiceFor} onToggle={onToggle} />
      <TouchHaptics enabled={haptics} />
      <LinkPreviewLayer />
    </>
  );
}
