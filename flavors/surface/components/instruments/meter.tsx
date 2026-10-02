"use client";

import * as React from "react";
import { shownIndex, useKnob } from "@/flavors/surface/lib/knob/store";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

/** Kept in step with `SWEEP` in the 3D part, which this chunk must not import. */
const SWEEP = 48;
const W = 120;
const H = 76;
const angleOf = (value: number) =>
  (Math.min(Math.max(value, 0), 1) * 2 - 1) * SWEEP;

/** The printed meter: ticks with no numerals and the needle at its reading. */
function MeterPoster({ value }: { value: number }) {
  const pivot = H / 2 - 9;
  const reach = Math.min(H - 20, W / 2 / Math.sin((SWEEP * Math.PI) / 180) - 8);
  return (
    <svg
      viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}
      data-bench-poster
      className="absolute inset-0 size-full"
    >
      <rect
        x={-W / 2 + 2.5}
        y={-H / 2 + 2.5}
        width={W - 5}
        height={H - 5}
        rx="4"
        fill="none"
        strokeWidth="5"
        className="stroke-ink-3"
      />
      <g className="stroke-lcd-ink">
        {Array.from({ length: 11 }, (_, i) => {
          const a = ((i / 10) * 2 * SWEEP - SWEEP) * (Math.PI / 180);
          const long = i % 5 === 0 ? 7 : 4;
          const at = (r: number) => ({
            x: Math.round(Math.sin(a) * r * 100) / 100,
            y: Math.round((pivot - Math.cos(a) * r) * 100) / 100,
          });
          const from = at(reach - long);
          const to = at(reach);
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              strokeWidth={i % 5 === 0 ? 1.6 : 1}
            />
          );
        })}
      </g>
      <line
        x1="0"
        y1={pivot}
        x2="0"
        y2={pivot - reach}
        strokeWidth="1.3"
        className="stroke-lcd-ink"
        style={{
          transform: `rotate(${angleOf(value)}deg)`,
          transformOrigin: `0 ${pivot}px`,
          transition: "transform 550ms var(--ease-detent)",
        }}
      />
      <circle cy={pivot} r="4" className="fill-lcd-ink" />
    </svg>
  );
}

/**
 * An analog needle meter on the LCD glass. `bump` knocks it when the mouse
 * comes over it; `tremble` keeps it shivering while the mouse is on it.
 */
export function NeedleMeter({
  name,
  value,
  hover = "bump",
  className,
}: {
  name: string;
  /** 0 to 1. */
  value: number;
  hover?: "bump" | "tremble";
  className?: string | undefined;
}) {
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/meter").then((m) =>
      m.attachMeter(host, options, name, value)
    )
  );

  React.useEffect(() => {
    handle.current?.read(value);
  }, [handle, value]);

  return (
    <span
      ref={rootRef}
      aria-hidden
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        if (hover === "bump") handle.current?.bump();
        else handle.current?.tremble(true);
      }}
      onPointerLeave={() => {
        if (hover === "tremble") handle.current?.tremble(false);
      }}
      className={cn("glass relative block shrink-0", className)}
      style={{ width: W, height: H }}
    >
      <MeterPoster value={value} />
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
    </span>
  );
}

/**
 * `/work`'s meter: the knob's track, as that role's tenure over the
 * longest one's. `tenures` are in months, one per role.
 */
export function TenureMeter({
  tenures,
  className,
}: {
  tenures: readonly number[];
  className?: string;
}) {
  const live = useKnob((s) => s.count === tenures.length);
  const shown = useKnob(shownIndex);
  const longest = Math.max(1, ...tenures);
  const value = (tenures[live ? shown : 0] ?? 0) / longest;
  return <NeedleMeter name="tenure" value={value} className={className} />;
}
