"use client";

import * as React from "react";
import type {
  ToggleLayout,
  Toggles,
} from "@/flavors/surface/components/scene/instruments/toggle";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

/** Kept in step with `THROW` in the 3D part, which this chunk must not import. */
const THROW = 32;

/**
 * The printed levers: each a nut with its bat handle thrown to its
 * position, drawn from the front like the 3D ones. `pitch` in px, like the
 * part's layout.
 */
function LeverPoster({
  layout,
  positions,
  width,
  height,
}: {
  layout: ToggleLayout;
  positions: readonly number[];
  width: number;
  height: number;
}) {
  const { count, axis, pitch } = layout;
  const s = Math.min(pitch * 0.24, (axis === "y" ? height : width) * 0.13);
  return (
    <svg
      viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      data-bench-poster
      className="absolute inset-0 size-full"
    >
      {positions.map((p, i) => {
        const along = (i - (count - 1) / 2) * pitch;
        const [cx, cy] = axis === "y" ? [along, 0] : [0, along];
        const reach = Math.sin((p * THROW * Math.PI) / 180) * 2.7 * s;
        const [tx, ty] = axis === "y" ? [cx, cy - reach] : [cx + reach, cy];
        return (
          <g key={i}>
            <polygon
              points={[0, 60, 120, 180, 240, 300]
                .map((a) => {
                  const r = (a * Math.PI) / 180;
                  return `${cx + Math.cos(r) * s},${cy + Math.sin(r) * s}`;
                })
                .join(" ")}
              className="fill-ink-3"
            />
            <line
              x1={cx}
              y1={cy}
              x2={tx}
              y2={ty}
              strokeWidth={s * 0.5}
              strokeLinecap="round"
              className="stroke-ink-2"
            />
            <circle cx={tx} cy={ty} r={s * 0.36} className="fill-ink-2" />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Bat-handle toggles on the bench. `positions` are each lever's throw (-1,
 * 0 or 1); a `name` is one bank for the session, so a lever springs from
 * wherever it was left. The slot is `width` by `height` CSS px.
 */
export function Levers({
  name,
  layout,
  positions,
  width,
  height,
  className,
  ...props
}: {
  name: string;
  layout: ToggleLayout;
  positions: readonly number[];
  width: number;
  height: number;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "className">) {
  const { rootRef, hostRef, handle } = useInstrument<Toggles>((host, options) =>
    import("@/flavors/surface/components/scene/instruments/toggle").then((m) =>
      m.attachToggles(host, options, name, layout, positions)
    )
  );
  const key = positions.join(",");

  React.useEffect(() => {
    key.split(",").forEach((p, i) => handle.current?.throw(i, Number(p)));
  }, [handle, key]);

  return (
    <span
      ref={rootRef}
      aria-hidden
      className={cn("relative block shrink-0 select-none", className)}
      style={{ width, height }}
      {...props}
    >
      <LeverPoster
        layout={layout}
        positions={positions}
        width={width}
        height={height}
      />
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
    </span>
  );
}
