"use client";

import * as React from "react";

import { playTick, playVoice, suspendSound, type Voice } from "@/lib/sound";

const CLICKABLE = "a, button, [role=button], [role=switch], [role=radio]";

type ClickSoundProps = {
  enabled?: boolean;
  voiceFor?: (el: Element, event: MouseEvent) => Voice | null;
  onToggle?: (details: HTMLDetailsElement) => Voice | null;
};

export function ClickSound({
  enabled = true,
  voiceFor,
  onToggle,
}: ClickSoundProps) {
  React.useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      if (document.hidden) return;
      if (!(event.target instanceof Element)) return;

      const control = event.target.closest(CLICKABLE);
      if (!control) return;
      if (control instanceof HTMLAnchorElement && event.detail === 0) return;

      const named =
        event.target.closest("[data-voice]") ?? control.closest("[data-voice]");
      // Open owner device check: confirm iOS Safari delivers `click` as a
      // PointerEvent with pointerType "touch"; if not, taps there still tick.
      if (
        event instanceof PointerEvent &&
        event.pointerType === "touch" &&
        !(voiceFor && named)
      )
        return;

      if (voiceFor) {
        const voice = voiceFor(named ?? control, event);
        if (voice) playVoice(voice);
      } else {
        playTick(control instanceof HTMLAnchorElement ? "link" : "button");
      }
    };

    const onDetailsToggle = (event: Event) => {
      if (document.hidden || !(event.target instanceof HTMLDetailsElement))
        return;
      const voice = onToggle?.(event.target);
      if (voice) playVoice(voice);
    };

    document.addEventListener("click", onClick, { capture: true });
    if (onToggle)
      document.addEventListener("toggle", onDetailsToggle, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      if (onToggle)
        document.removeEventListener("toggle", onDetailsToggle, {
          capture: true,
        });
      suspendSound();
    };
  }, [enabled, voiceFor, onToggle]);

  return null;
}
