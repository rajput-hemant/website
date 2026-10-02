"use client";

import * as React from "react";
import type { Screws } from "@/flavors/surface/components/scene/instruments/screws";
import { knobSounds } from "@/flavors/surface/lib/sound/detents";
import { cn } from "@/flavors/surface/lib/utils";

import { useTurn } from "./gesture";
import { useInstrument } from "./use-instrument";

/** A hover turns a screw this far; a drag turns it in notches this far apart. */
const NUDGE = 12;
const NOTCH = 30;

const CORNERS = [
  "top-0 left-0",
  "top-0 right-0",
  "bottom-0 left-0",
  "bottom-0 right-0",
] as const;

function Screw({
  i,
  inset,
  radius,
  screws,
}: {
  i: number;
  inset: readonly [number, number];
  radius: number;
  screws: React.RefObject<Screws | null>;
}) {
  const start = React.useRef(0);
  const notch = React.useRef(0);
  const turn = useTurn({
    onTurn(degrees) {
      const s = screws.current;
      if (!s) return;
      const n = Math.round(degrees / NOTCH);
      if (n === notch.current) return;
      notch.current = n;
      knobSounds.detent(((n % 4) + 4) % 4, 4);
      s.turn(i, start.current + n * NOTCH);
    },
    onEnd() {},
  });
  const size = radius * 2 + 10;

  return (
    <span
      data-cursor="Turn"
      onPointerEnter={(event) => {
        const s = screws.current;
        if (!s || event.pointerType !== "mouse" || event.buttons) return;
        knobSounds.detent(i, 4);
        s.turn(i, s.angle(i) + NUDGE);
      }}
      onPointerDown={(event) => {
        start.current = screws.current?.angle(i) ?? 0;
        notch.current = 0;
        turn.onPointerDown(event);
      }}
      onPointerMove={turn.onPointerMove}
      onPointerUp={turn.onPointerUp}
      onPointerCancel={turn.onPointerUp}
      className={cn(
        "pointer-events-auto absolute hidden touch-none rounded-full group-data-bench-live:block",
        CORNERS[i]
      )}
      style={{
        width: size,
        height: size,
        margin: `${inset[1] - size / 2}px ${inset[0] - size / 2}px`,
      }}
    />
  );
}

/**
 * Four 3D screws over the corners of a plate (`relative`): hover one and it
 * turns a little with a detent tick; drag it round in 30 degree notches. It
 * keeps its angle for the session. The printed heads underneath (`posters`,
 * or the plate's own rivets) stay at T0.
 */
export function PlateScrews({
  name,
  inset = [9, 9],
  radius = 4.5,
  posters,
  className,
}: {
  name: string;
  inset?: readonly [number, number];
  radius?: number;
  posters?: React.ReactNode;
  className?: string;
}) {
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/screws").then((m) =>
      m.attachScrews(host, options, name, { inset, radius })
    )
  );

  return (
    <span
      ref={rootRef}
      aria-hidden
      data-print="hide"
      className={cn(
        "group pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
    >
      {posters && <span data-bench-poster>{posters}</span>}
      <span ref={hostRef} data-bench-host className="absolute inset-0" />
      {[0, 1, 2, 3].map((i) => (
        <Screw key={i} i={i} inset={inset} radius={radius} screws={handle} />
      ))}
    </span>
  );
}
