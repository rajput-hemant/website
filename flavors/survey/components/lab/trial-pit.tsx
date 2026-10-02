"use client";

import * as React from "react";
import type { Handle } from "@/flavors/survey/components/scene/glyphs/kit";
import {
  hostClass,
  posterClass,
} from "@/flavors/survey/components/scene/turn-pointer";
import { useHoverGlyph } from "@/flavors/survey/components/scene/use-glyph";
import type { BlockSpec } from "@/flavors/survey/lib/ridge-block";
import { cn } from "@/flavors/survey/lib/utils";

/** Degrees of yaw the card's width sweeps either side. */
const SWEEP = 24;

/**
 * L2: pointing at a trial's card (with a mouse) swaps its static poster for
 * a live cut of the relief round the trial's stake; the pointer that tilts
 * the card turns and pitches the block with it. Leaving settles it and the
 * poster comes back, so only the pointed card draws. Touch and T0 keep the
 * poster. Decorative: the card says what the trial is.
 */
export function TrialPit({
  spec,
  className,
  children,
}: {
  spec: BlockSpec;
  className?: string;
  /** The poster. */
  children: React.ReactNode;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  useHoverGlyph<Handle>(rootRef, hostRef, {
    load: async () => {
      const { attachRidge } =
        await import("@/flavors/survey/components/scene/glyphs/ridge");
      return (host, options) =>
        attachRidge(host, spec, {
          ...options,
          aspect: host.clientWidth / Math.max(1, host.clientHeight),
        });
    },
    target: (root) => root.closest("a"),
    enter: () => {},
    leave: (pit) => {
      pit.aim(0);
      pit.lean(0, 0);
    },
    move: (pit, event) => {
      const box = rootRef.current?.closest("a")?.getBoundingClientRect();
      if (!box) return;
      const x = ((event.clientX - box.left) / box.width) * 2 - 1;
      const y = ((event.clientY - box.top) / box.height) * 2 - 1;
      pit.aim(x * SWEEP);
      pit.lean(0, y);
    },
  });

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="pit"
      className={cn("group relative size-full", className)}
    >
      <div className={posterClass}>{children}</div>
      <div ref={hostRef} className={hostClass} />
    </div>
  );
}
