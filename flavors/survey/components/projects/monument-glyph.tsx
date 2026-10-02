"use client";

import * as React from "react";
import type { Monument } from "@/flavors/survey/components/scene/glyphs/monument";
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

import type { ProjectStatus } from "@/lib/data/types";

import { SiteSymbol } from "./site-symbol";

/* The glyph chunk (three.js) loads only once the browser is idle, and never at T0. */
const loader =
  (status: ProjectStatus): Loader<Monument> =>
  async () => {
    const { attachMonument } =
      await import("@/flavors/survey/components/scene/glyphs/monument");
    return (host, options) => attachMonument(host, status, options);
  };

/**
 * The site's condition monument beside "Marked on the sheet as": the map
 * symbol stood up in 3D, which a drag spins (with inertia when motion is
 * on) and the mouse leans. The printed symbol is the poster, the T0 state
 * and the fallback. Decorative: the sentence beside it says the same.
 */
export function SiteMonument({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const glyph = useGlyph(rootRef, hostRef, loader(status), { key: status });

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="monument"
      data-cursor="Turn"
      {...turnPointer(glyph)}
      className={cn(
        "group relative size-24 shrink-0 touch-pan-y select-none",
        className
      )}
    >
      <div className={cn(posterClass, "p-[22%]")}>
        <SiteSymbol status={status} className="size-full" />
      </div>
      <div ref={hostRef} className={hostClass} />
    </div>
  );
}

/**
 * A gazetteer row's condition symbol. Pointing at the row (with a mouse)
 * stands the symbol up in 3D and turns it a quarter; leaving turns it back
 * and hands over to the printed symbol again (`bindHoverGlyph`), so only
 * hovered rows ever draw, and never more than the engine's four at once.
 */
export function RowMonument({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  useHoverGlyph(
    rootRef,
    hostRef,
    {
      load: loader(status),
      target: (root) => root.closest("li"),
      enter: (monument) => monument.aim(90),
      leave: (monument) => monument.aim(0),
    },
    status
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="row"
      className={cn("group relative size-7 shrink-0", className)}
    >
      <SiteSymbol status={status} className={posterClass} />
      <div ref={hostRef} className={hostClass} />
    </div>
  );
}
