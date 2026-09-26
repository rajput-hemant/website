"use client";

import * as React from "react";

import { usePrefs } from "@/lib/prefs-store";
import { playTick, suspendSound } from "@/lib/sound";

const CLICKABLE = "a, button, [role=button], [role=switch], [role=radio]";

/**
 * Plays a short tick on clicks of links and controls. Self-gated on the sound
 * preference, so it can be mounted unconditionally (e.g. once in the layout).
 */
export function ClickSound() {
  const { sound } = usePrefs();

  React.useEffect(() => {
    if (!sound) return;

    const onClick = (event: MouseEvent) => {
      if (document.hidden) return;
      if (event instanceof PointerEvent && event.pointerType === "touch") {
        return;
      }
      if (!(event.target instanceof Element)) return;

      const control = event.target.closest(CLICKABLE);
      if (!control) return;
      playTick(control instanceof HTMLAnchorElement ? "link" : "button");
    };

    // Capture phase, so handlers that stop propagation still get their tick.
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      suspendSound();
    };
  }, [sound]);

  return null;
}
