"use client";

import { useEffect } from "react";

import { playTick, suspendSound } from "@/lib/sound";

const CLICKABLE = "a, button, [role=button], [role=switch], [role=radio]";

/** Plays a tick on clicks of links and controls. Mounted only while the sound preference is on. */
export function ClickSound() {
  useEffect(() => {
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
  }, []);

  return null;
}
