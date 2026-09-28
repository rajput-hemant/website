"use client";

import * as React from "react";
import {
  hostClass,
  posterClass,
  turnPointer,
} from "@/flavors/survey/components/scene/turn-pointer";
import { useGlyph } from "@/flavors/survey/components/scene/use-glyph";
import type { BlockSpec } from "@/flavors/survey/lib/ridge-block";
import { cn } from "@/flavors/survey/lib/utils";

import type { BlockPosterPaths } from "./ridge-poster";
import { RidgePoster } from "./ridge-poster";

/**
 * W2: the role's ridge as a block diagram beside its transect. A drag turns
 * it up to 30 degrees either side and it springs back when let go; the
 * mouse leans it. It draws only while near the screen, so a long /work
 * never holds more than the engine's four. The SVG poster is the same
 * block at rest, and the T0 state. Decorative: the transect beside it
 * carries the same section.
 */
export function RidgeGlyph({
  spec,
  poster,
  className,
}: {
  spec: BlockSpec;
  poster: BlockPosterPaths;
  className?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const glyph = useGlyph(
    rootRef,
    hostRef,
    async () => {
      const { attachRidge } =
        await import("@/flavors/survey/components/scene/glyphs/ridge");
      return (host, options) =>
        attachRidge(host, spec, {
          ...options,
          aspect: host.clientWidth / Math.max(1, host.clientHeight),
        });
    },
    { inView: true }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="ridge"
      data-cursor="Turn"
      {...turnPointer(glyph)}
      className={cn(
        "group relative aspect-[8/5] w-40 touch-pan-y select-none",
        className
      )}
    >
      <RidgePoster paths={poster} className={posterClass} />
      <div ref={hostRef} className={hostClass} />
    </div>
  );
}
