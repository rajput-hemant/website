"use client";

import * as React from "react";
import type { Lamp } from "@/flavors/surface/components/scene/instruments/lamp";
import { knobStore, shownIndex } from "@/flavors/surface/lib/knob/store";
import { usePrefs } from "@/flavors/surface/lib/prefs-store";

import { detectTier } from "@/lib/scene/tier";
import { useIdleReady } from "@/components/semantic/use-idle-ready";

/** How far from the lens the mouse still leans it, in CSS px. */
const REACH = 160;

/**
 * The travelling jewel lamp on `/projects`: one 3D lamp that moves into the
 * status slot (`data-lamp-slot`) of whichever preset the knob shows, lit
 * and pulsing as that preset's printed lamp says. One lamp on the page, not
 * one per preset; every other slot keeps its printed lamp.
 */
export function PresetLamp() {
  const ready = useIdleReady(2500);
  const scene = usePrefs().scene;

  React.useEffect(() => {
    if (!ready) return;
    const tier = detectTier();
    if (tier === 0) return;
    let cancelled = false;
    let lamp: Lamp | null = null;
    let slot: HTMLElement | null = null;
    let unwatch = () => {};

    const leave = () => {
      lamp?.detach();
      lamp = null;
      if (slot) delete slot.dataset.benchLive;
      slot = null;
    };
    const lean = (event: PointerEvent) => {
      if (!lamp || !slot || event.pointerType !== "mouse") return;
      const box = slot.getBoundingClientRect();
      const k = (v: number) => Math.max(-1, Math.min(1, v / REACH));
      lamp.lean(
        k(event.clientX - box.left - box.width / 2),
        k(event.clientY - box.top - box.height / 2)
      );
    };

    void import("@/flavors/surface/components/scene/instruments/lamp").then(
      ({ attachLamp }) => {
        if (cancelled) return;
        const follow = (index: number) => {
          const next = document.querySelector<HTMLElement>(
            `[data-knob-item="${index}"] [data-lamp-slot]`
          );
          if (next === slot) return;
          leave();
          const host = next?.querySelector<HTMLElement>("[data-bench-host]");
          if (!next || !host) return;
          const here = next;
          slot = here;
          lamp = attachLamp(
            host,
            {
              tier,
              onLost: () => {
                delete here.dataset.benchLive;
              },
              onRestored: () => {
                here.dataset.benchLive = "";
              },
            },
            "preset",
            here.dataset.tone === "signal" ? "signal" : "off"
          );
          here.dataset.benchLive = "";
        };
        follow(shownIndex(knobStore.getState()));
        unwatch = knobStore.subscribe((state) => follow(shownIndex(state)));
        document.addEventListener("pointermove", lean, { passive: true });
      }
    );

    return () => {
      cancelled = true;
      unwatch();
      document.removeEventListener("pointermove", lean);
      leave();
    };
  }, [ready, scene]);

  return null;
}
