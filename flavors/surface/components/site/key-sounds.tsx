"use client";

import * as React from "react";
import { KEYED, playKey } from "@/flavors/surface/lib/sound/voices";

/** The pressable key under a pointer event, unless it is silenced or disabled. */
function keyOf(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;
  const key = target.closest(KEYED);
  if (!key || key.closest('[cmdk-root], [data-voice="none"]')) return null;
  if (key.matches(":disabled, [aria-disabled=true]")) return null;
  return key;
}

/**
 * The key leaf: down on press, with the `:active` sink, and up on a release
 * inside the same key. Touch stays silent (it doubles the OS haptic and
 * mis-fires on scroll starts); ClickSound covers keyboard presses.
 */
export function KeySounds({ enabled }: { enabled: boolean }) {
  React.useEffect(() => {
    if (!enabled) return;
    let pressed: Element | null = null;

    const down = (event: PointerEvent) => {
      pressed = null;
      if (event.pointerType === "touch" || event.button !== 0) return;
      const key = keyOf(event.target);
      if (key && playKey("down")) pressed = key;
    };
    const up = (event: PointerEvent) => {
      const key = pressed;
      pressed = null;
      if (key && keyOf(event.target) === key) playKey("up");
    };
    const cancel = () => {
      pressed = null;
    };

    document.addEventListener("pointerdown", down, { capture: true });
    document.addEventListener("pointerup", up, { capture: true });
    document.addEventListener("pointercancel", cancel, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", down, { capture: true });
      document.removeEventListener("pointerup", up, { capture: true });
      document.removeEventListener("pointercancel", cancel, { capture: true });
    };
  }, [enabled]);

  return null;
}
