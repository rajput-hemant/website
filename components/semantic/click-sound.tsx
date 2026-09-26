"use client";

import * as React from "react";

import { playTick, suspendSound } from "@/lib/sound";

const CLICKABLE = "a, button, [role=button], [role=switch], [role=radio]";

/**
 * Plays a short tick on clicks of links and controls while `enabled`, so an
 * edition can mount it once and gate it on its own sound preference.
 */
export function ClickSound({ enabled = true }: { enabled?: boolean }) {
  React.useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);

  return null;
}
