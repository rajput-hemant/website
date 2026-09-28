"use client";

import * as React from "react";

import {
  cancelHaptics,
  haptic,
  preloadHaptics,
  type HapticKind,
} from "@/lib/haptics";

const SELECTS =
  "[role=switch], [role=radio], [role=checkbox], [role=menuitemradio], input[type=checkbox], input[type=radio]";
const CLICKABLE = `a, button, [role=button], summary, ${SELECTS}`;
const KINDS: readonly string[] = ["tap", "select", "success", "error", "nudge"];

/** How recent a touch `pointerdown` must be to own the `click` after it. */
const PRESS_MS = 1000;

type TouchHapticsProps = {
  enabled?: boolean;
  /** Picks the feedback for a tapped control; null keeps it still. */
  hapticFor?: (el: Element, event: MouseEvent) => HapticKind | null;
};

function isHapticKind(value: string): value is HapticKind {
  return KINDS.includes(value);
}

/** Switches and radios "select", every other control "tap". */
function defaultHaptic(control: Element): HapticKind {
  return control.matches(SELECTS) ? "select" : "tap";
}

/**
 * Touch feedback for taps on controls, the touch counterpart of ClickSound:
 * one capture listener on the document that answers only touch and pen
 * clicks, never mouse or keyboard activation. `data-haptic="<kind>|none"` on
 * a control (or an ancestor) overrides the choice; otherwise `hapticFor`
 * decides, then the default. The engine starts loading on the first touch
 * `pointerdown`, so the first tap can usually buzz already.
 */
export function TouchHaptics({ enabled = true, hapticFor }: TouchHapticsProps) {
  React.useEffect(() => {
    if (!enabled) return;
    let press = { type: "", at: -Infinity };

    const onPointerDown = (event: PointerEvent) => {
      press = { type: event.pointerType, at: event.timeStamp };
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        void preloadHaptics();
      }
    };

    const onClick = (event: MouseEvent) => {
      // Keyboard activation and scripted clicks (the engine's own) carry no detail.
      if (event.detail === 0) return;
      if (!(event.target instanceof Element)) return;
      // Older WebKit sends `click` as a plain MouseEvent; fall back to the press.
      const type =
        event instanceof PointerEvent && event.pointerType !== ""
          ? event.pointerType
          : event.timeStamp - press.at < PRESS_MS
            ? press.type
            : "";
      if (type !== "touch" && type !== "pen") return;

      const control = event.target.closest(CLICKABLE);
      if (!control) return;
      const named = event.target.closest("[data-haptic]");
      const override = named?.getAttribute("data-haptic") ?? "";
      if (override === "none") return;
      const kind = isHapticKind(override)
        ? override
        : hapticFor
          ? hapticFor(control, event)
          : defaultHaptic(control);
      if (kind) haptic(kind);
    };

    const onVisibility = () => {
      if (document.hidden) cancelHaptics();
    };

    const capture = { capture: true, passive: true };
    document.addEventListener("pointerdown", onPointerDown, capture);
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, capture);
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", onVisibility);
      cancelHaptics();
    };
  }, [enabled, hapticFor]);

  return null;
}
