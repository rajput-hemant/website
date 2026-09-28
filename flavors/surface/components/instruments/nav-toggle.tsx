"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { knobSounds } from "@/flavors/surface/lib/sound/detents";
import { playRelay, playSlide } from "@/flavors/surface/lib/sound/voices";
import { cn } from "@/flavors/surface/lib/utils";

import { Levers } from "./toggles";

/** Pixels of sideways drag that throw the lever. */
const FLICK = 12;
const LAYOUT = { count: 1, axis: "x", pitch: 40 } as const;

/**
 * A centre-off bat-handle toggle between the previous and next presets:
 * flick it left or right (drag, or click a side) to load that preset. The
 * lever springs back to centre on the page it loads. A side with nowhere to
 * go gives a little and meets its stop. Pointer only: the links beside it
 * are the accessible way. Key it by the page, so each page starts centred.
 */
export function NavToggle({
  prev,
  next,
  className,
}: {
  prev?: string | undefined;
  next?: string | undefined;
  className?: string;
}) {
  const router = useRouter();
  const [thrown, setThrown] = React.useState(0);
  const press = React.useRef<{ id: number; x: number; done: boolean } | null>(
    null
  );

  const flick = (side: -1 | 1) => {
    const href = side < 0 ? prev : next;
    if (!href) {
      knobSounds.endStop();
      setThrown(side * 0.3);
      window.setTimeout(() => setThrown(0), 120);
      return;
    }
    setThrown(side);
    playSlide();
    const go = () => {
      playRelay();
      router.push(href);
    };
    // Let the lever land before the page changes, unless nothing moves.
    if (document.documentElement.dataset.motion === "on") {
      window.setTimeout(go, 160);
    } else go();
  };

  return (
    <Levers
      name="preset-nav"
      layout={LAYOUT}
      positions={[thrown]}
      width={72}
      height={40}
      data-cursor="Flick"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        press.current = { id: event.pointerId, x: event.clientX, done: false };
      }}
      onPointerMove={(event) => {
        const p = press.current;
        if (!p || p.id !== event.pointerId || p.done) return;
        const dx = event.clientX - p.x;
        if (Math.abs(dx) < FLICK) return;
        p.done = true;
        flick(dx < 0 ? -1 : 1);
      }}
      onPointerUp={(event) => {
        const p = press.current;
        press.current = null;
        if (!p || p.id !== event.pointerId || p.done) return;
        const box = event.currentTarget.getBoundingClientRect();
        flick(event.clientX < box.left + box.width / 2 ? -1 : 1);
      }}
      onPointerCancel={() => {
        press.current = null;
      }}
      className={cn("cursor-pointer touch-pan-y", className)}
    />
  );
}
