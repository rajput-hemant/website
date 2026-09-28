"use client";

import * as React from "react";
import { pointerAngle, wrapDelta } from "@/flavors/surface/lib/knob/geometry";

/** Degrees of travel before a press counts as a turn rather than a click. */
export const TURN_SLOP = 4;

type Turning = { id: number; last: number; turned: number; travel: number };

const angleOf = (event: React.PointerEvent<HTMLElement>) => {
  const box = event.currentTarget.getBoundingClientRect();
  return pointerAngle(
    event.clientX - box.left - box.width / 2,
    event.clientY - box.top - box.height / 2
  );
};

/**
 * Pointer handlers that turn something round the centre of the element they
 * sit on, like the knob: `onTurn` gets the degrees turned since the press
 * (clockwise positive), `onEnd` whether it was a turn or a click.
 */
export function useTurn({
  onTurn,
  onEnd,
}: {
  onTurn: (degrees: number) => void;
  onEnd: (turned: boolean) => void;
}) {
  const turning = React.useRef<Turning | null>(null);
  return {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (turning.current || event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      turning.current = {
        id: event.pointerId,
        last: angleOf(event),
        turned: 0,
        travel: 0,
      };
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const g = turning.current;
      if (!g || g.id !== event.pointerId) return;
      const a = angleOf(event);
      const d = wrapDelta(a - g.last);
      g.last = a;
      g.turned += d;
      g.travel += Math.abs(d);
      if (g.travel >= TURN_SLOP) onTurn(g.turned);
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const g = turning.current;
      if (!g || g.id !== event.pointerId) return;
      turning.current = null;
      if (event.type !== "pointercancel") onEnd(g.travel >= TURN_SLOP);
    },
  };
}
