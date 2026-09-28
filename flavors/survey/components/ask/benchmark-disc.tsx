"use client";

import * as React from "react";
import type { Handle } from "@/flavors/survey/components/scene/glyphs/kit";
import {
  hostClass,
  posterClass,
  turnPointer,
} from "@/flavors/survey/components/scene/turn-pointer";
import {
  useGlyph,
  useHoverGlyph,
  type Loader,
} from "@/flavors/survey/components/scene/use-glyph";
import { cn } from "@/flavors/survey/lib/utils";

/** How far from the disc, in CSS pixels, the pointer tilts it fully. */
const REACH = 220;

const loader =
  (lean: number, spin: boolean): Loader<Handle> =>
  async () => {
    const { attachDisc } =
      await import("@/flavors/survey/components/scene/glyphs/disc");
    return (host, options) => attachDisc(host, { ...options, lean, spin });
  };

/** The printed benchmark: a disc with its broad arrow under the bench line. */
export function DiscPoster({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="-6 -6 12 12" className={className}>
      <circle r="5" className="fill-contour stroke-ink" strokeWidth="0.5" />
      <path
        d="M0 -1.1V2.9M0 -1.1L-1.5 1.6M0 -1.1L1.5 1.6M-2.3 -1.9H2.3"
        className="fill-none stroke-ink"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * K2: a 20px brass benchmark beside a notebook entry's number. Pointing
 * anywhere in the entry (with a mouse) stands it up in 3D and tilts it up
 * to 15 degrees toward the pointer; leaving flattens it and the printed
 * disc comes back, so only the pointed entry draws.
 */
export function EntryDisc({ className }: { className?: string }) {
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const hostRef = React.useRef<HTMLSpanElement>(null);
  useHoverGlyph<Handle>(rootRef, hostRef, {
    load: loader(15, false),
    target: (root) => root.closest("article"),
    enter: () => {},
    leave: (disc) => disc.lean(0, 0),
    move: (disc, event) => {
      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v / REACH));
      disc.lean(
        clamp(event.clientX - (box.left + box.width / 2)),
        clamp(event.clientY - (box.top + box.height / 2))
      );
    },
  });
  return (
    <span
      ref={rootRef}
      aria-hidden
      data-glyph="disc"
      className={cn("group relative inline-block size-5 shrink-0", className)}
    >
      <DiscPoster className={posterClass} />
      <span ref={hostRef} className={hostClass} />
    </span>
  );
}

/**
 * E2: the entry page's benchmark, 72px beside its title. A drag spins it
 * (with inertia when motion is on) and the mouse tilts it; the printed disc
 * is the poster and the T0 state.
 */
export function EntryMark({ className }: { className?: string }) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const glyph = useGlyph(rootRef, hostRef, loader(10, true));
  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="benchmark"
      data-cursor="Turn"
      {...turnPointer(glyph)}
      className={cn(
        "group relative size-18 shrink-0 touch-pan-y select-none",
        className
      )}
    >
      <DiscPoster className={posterClass} />
      <div ref={hostRef} className={hostClass} />
    </div>
  );
}
