"use client";

import * as React from "react";
import type { Instrument } from "@/flavors/survey/components/scene/glyphs/instrument";
import {
  hostClass,
  posterClass,
  turnPointer,
} from "@/flavors/survey/components/scene/turn-pointer";
import { useGlyph } from "@/flavors/survey/components/scene/use-glyph";
import { cn } from "@/flavors/survey/lib/utils";

/** Each kit's bearing across the front (degrees past rest) and elevation. */
export function kitSight(index: number, count: number) {
  const bearing = count > 1 ? -70 + (140 * index) / (count - 1) : 0;
  const elevation = ((index * 7) % 5) * 3 - 5;
  return { bearing, elevation };
}

/**
 * A2: the survey's theodolite beside the instruments. A drag turns the
 * alidade; pointing at a kit (`data-kit` rows in the same section) swings
 * the telescope to that kit's bearing, and leaving the list brings it back.
 * The printed instrument is the poster and the T0 state. Decorative: the
 * list names every instrument.
 */
export function InstrumentGlyph({
  kits,
  className,
}: {
  kits: number;
  className?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const glyph = useGlyph<Instrument>(rootRef, hostRef, async () => {
    const { attachInstrument } =
      await import("@/flavors/survey/components/scene/glyphs/instrument");
    return (host, options) =>
      attachInstrument(host, {
        ...options,
        aspect: host.clientWidth / Math.max(1, host.clientHeight),
      });
  });

  React.useEffect(() => {
    const section = rootRef.current?.closest("section");
    const list = section?.querySelector<HTMLElement>("[data-kits]");
    if (!list) return;
    let at = -1;
    const over = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const row =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-kit]")
          : null;
      const i = row ? Number(row.dataset.kit) : -1;
      if (i === at || i < 0) return;
      at = i;
      const { bearing, elevation } = kitSight(i, kits);
      glyph.current?.sight(bearing, elevation);
    };
    const leave = () => {
      at = -1;
      glyph.current?.sight(0, 0);
    };
    list.addEventListener("pointerover", over);
    list.addEventListener("pointerleave", leave);
    return () => {
      list.removeEventListener("pointerover", over);
      list.removeEventListener("pointerleave", leave);
    };
  }, [kits, glyph]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="instrument"
      data-cursor="Turn"
      {...turnPointer(glyph)}
      className={cn(
        "group relative aspect-[9/10] w-45 shrink-0 touch-pan-y select-none",
        className
      )}
    >
      <svg viewBox="0 0 90 100" className={posterClass}>
        <g
          className="fill-none stroke-ink"
          strokeWidth="1"
          strokeLinecap="round"
        >
          <path d="M45 50L22 94M45 50L68 94M45 50L49 90" />
        </g>
        <path
          d="M33 46h24v4H33Z"
          className="fill-sheet stroke-ink"
          strokeWidth="0.8"
        />
        <path
          d="M38 34h3v12h-3ZM49 34h3v12h-3Z"
          className="fill-contour stroke-ink"
          strokeWidth="0.8"
        />
        <path
          d="M30 33l30-4 1 5-30 4Z"
          className="fill-contour stroke-ink"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
      <div ref={hostRef} className={hostClass} />
    </div>
  );
}
