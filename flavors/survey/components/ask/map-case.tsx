"use client";

import * as React from "react";
import type { MapCase as Case } from "@/flavors/survey/components/scene/glyphs/case";
import {
  hostClass,
  posterClass,
} from "@/flavors/survey/components/scene/turn-pointer";
import { useGlyph } from "@/flavors/survey/components/scene/use-glyph";
import { cn } from "@/flavors/survey/lib/utils";

/**
 * O1: the surveyor's map case beside the sign-in. Shut and latched until
 * the owner signs in, when its lid opens on its hinge; pointing at it lifts
 * the latch. The printed case is the poster and the T0 state. Decorative:
 * the panel beside it says whether you are signed in.
 */
export function MapCase({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  // Mounted at the state it finds; later changes swing the lid.
  const first = React.useRef(open);
  const glyph = useGlyph<Case>(rootRef, hostRef, async () => {
    const { attachCase } =
      await import("@/flavors/survey/components/scene/glyphs/case");
    return (host, options) =>
      attachCase(host, { ...options, open: first.current });
  });

  React.useEffect(() => {
    first.current = open;
    glyph.current?.open(open);
  }, [open, glyph]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="case"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") glyph.current?.hover(true);
      }}
      onPointerLeave={() => glyph.current?.hover(false)}
      className={cn("group relative size-30 shrink-0", className)}
    >
      <svg viewBox="0 0 120 120" className={posterClass}>
        <path
          d="M18 62l52-14 34 12v26l-52 16-34-12Z"
          className="fill-ink stroke-sheet"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M18 62l52-14 34 12-52 16Z M52 76v26"
          className="fill-none stroke-sheet"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path d="M33 70l4-1v8l-4 1Z" className="fill-contour" />
      </svg>
      <div ref={hostRef} className={hostClass} />
    </div>
  );
}
