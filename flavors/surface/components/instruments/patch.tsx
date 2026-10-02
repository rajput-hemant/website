"use client";

import * as React from "react";
import type { PatchLayout } from "@/flavors/surface/components/scene/instruments/patch";
import { playLatch } from "@/flavors/surface/lib/sound/voices";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

const ROW = 30;
const OUT = 0.1;
/** Where the free plug hangs, from the Out jack (kept in step with the 3D part). */
const HANG = { x: 26, y: 44 };

/** Which socket each bay's plug is in, for the session (the 3D part remembers it too). */
const seatedIn = new Map<string, number | null>();

const layoutFor = (count: number): PatchLayout => ({
  out: OUT,
  sockets: Array.from({ length: count }, (_, i) =>
    count === 1 ? 0.62 : 0.36 + (i * 0.56) / (count - 1)
  ),
  row: ROW,
});

/** The printed bay: the jacks and the plug hanging on its cable. */
function PatchPoster({ layout }: { layout: PatchLayout }) {
  const jack = (f: number, key: string) => (
    <g key={key}>
      <circle cx={`${f * 100}%`} cy={ROW} r="9" className="fill-ink-3" />
      <circle cx={`${f * 100}%`} cy={ROW} r="4" className="fill-plate-lo" />
    </g>
  );
  return (
    <svg
      data-bench-poster
      className="absolute inset-0 size-full overflow-visible"
    >
      {jack(layout.out, "out")}
      {layout.sockets.map((f, i) => jack(f, String(i)))}
      <svg x={`${layout.out * 100}%`} className="overflow-visible">
        <path
          d={`M0 ${ROW} C0 ${ROW + 30}, ${HANG.x} ${ROW + 58}, ${HANG.x} ${ROW + HANG.y - 8}`}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-ink"
        />
        <rect
          x={HANG.x - 5}
          y={ROW + HANG.y - 10}
          width="10"
          height="22"
          rx="4"
          className="fill-ink"
        />
      </svg>
    </svg>
  );
}

/**
 * A patch bay: drag the plug from under the Out jack into a socket to use
 * what the socket is labelled with (`onPlug`). Let go anywhere else and it
 * swings home. Pointer only and aria-hidden: the same actions are links and
 * keys on the page. `sockets` are the legends engraved under the jacks.
 */
export function PatchBay({
  name,
  sockets,
  onPlug,
  className,
}: {
  name: string;
  sockets: readonly string[];
  onPlug: (socket: number) => void;
  className?: string;
}) {
  const layout = layoutFor(sockets.length);
  const [seated, setSeated] = React.useState(() => seatedIn.get(name) ?? null);
  const [held, setHeld] = React.useState<{ x: number; y: number } | null>(null);
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/patch").then((m) =>
      m.attachPatch(host, options, name, layout)
    )
  );

  /** Pointer position in the part's coordinates: from the slot's centre, y up. */
  const local = (event: React.PointerEvent<HTMLElement>) => {
    const box = rootRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0 };
    return {
      x: event.clientX - box.left - box.width / 2,
      y: box.height / 2 - (event.clientY - box.top),
    };
  };

  // The grip sits over the plug: held, in its socket, or hanging home.
  const grip = held
    ? { left: `calc(50% + ${held.x}px)`, top: `calc(50% - ${held.y}px)` }
    : seated !== null
      ? { left: `${(layout.sockets[seated] ?? 0) * 100}%`, top: ROW }
      : {
          left: `calc(${layout.out * 100}% + ${HANG.x}px)`,
          top: ROW + HANG.y,
        };

  return (
    <span
      ref={rootRef}
      aria-hidden
      className={cn("group relative block h-[124px] select-none", className)}
    >
      <PatchPoster layout={layout} />
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
      {[layout.out, ...layout.sockets].map((f, i) => (
        <span
          key={i}
          className="legend absolute -translate-x-1/2 text-[0.5625rem] whitespace-nowrap"
          style={{ left: `${f * 100}%`, top: ROW + 14 }}
        >
          {i === 0 ? "Out" : sockets[i - 1]}
        </span>
      ))}
      <span
        data-cursor="Patch"
        onPointerDown={(event) => {
          const bay = handle.current;
          if (event.button !== 0 || !bay) return;
          const at = local(event);
          if (!bay.grab(at.x, at.y)) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setHeld(at);
          setSeated(null);
          seatedIn.set(name, null);
        }}
        onPointerMove={(event) => {
          if (!held || !event.currentTarget.hasPointerCapture(event.pointerId))
            return;
          const at = local(event);
          handle.current?.move(at.x, at.y);
          setHeld(at);
        }}
        onPointerUp={() => {
          const bay = handle.current;
          if (!held || !bay) return;
          setHeld(null);
          const socket = bay.release();
          setSeated(socket);
          seatedIn.set(name, socket);
          if (socket === null) return;
          playLatch();
          onPlug(socket);
        }}
        onPointerCancel={() => {
          if (!held) return;
          setHeld(null);
          // A cancelled drag seats where it was let go, but does nothing.
          const socket = handle.current?.release() ?? null;
          setSeated(socket);
          seatedIn.set(name, socket);
        }}
        className="absolute hidden size-10 -translate-1/2 cursor-grab touch-none rounded-full group-data-bench-live:block active:cursor-grabbing"
        style={grip}
      />
    </span>
  );
}
