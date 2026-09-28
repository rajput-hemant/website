"use client";

import * as React from "react";
import { createRegisterGate } from "@/flavors/press/lib/sound/register-gate";
import { pressVoices } from "@/flavors/press/lib/sound/voices";

import { usePublicPathname } from "@/lib/public-pathname";
import { isSoundOn, playVoice } from "@/lib/sound";

const THROTTLE_MS = 1500;

/**
 * The register pins seat when a mouse or pen first pulls a `[data-register]`
 * headline into register on a page view. Hover sound is otherwise banned; this
 * is one sound per view at most, so touch and keyboard never hear it.
 */
export function RegisterPins({ enabled }: { enabled: boolean }) {
  const pathname = usePublicPathname();
  const [gate] = React.useState(() => createRegisterGate(THROTTLE_MS));

  React.useEffect(() => {
    if (!enabled) return;
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      if (!(event.target instanceof Element)) return;
      if (!event.target.matches("[data-register]") || !isSoundOn()) return;
      gate.enter(pathname, event.timeStamp, () => playVoice(pressVoices.pins));
    };
    // pointerenter does not bubble; a document capture listener still sees it.
    document.addEventListener("pointerenter", onEnter, { capture: true });
    return () =>
      document.removeEventListener("pointerenter", onEnter, { capture: true });
  }, [enabled, gate, pathname]);

  return null;
}
