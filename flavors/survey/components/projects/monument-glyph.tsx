"use client";

import * as React from "react";
import type {
  attachMonument,
  Monument,
} from "@/flavors/survey/components/scene/glyphs/monument";
import { usePrefs } from "@/flavors/survey/lib/prefs-store";
import { cn } from "@/flavors/survey/lib/utils";

import type { ProjectStatus } from "@/lib/data/types";
import { detectTier } from "@/lib/scene/tier";
import { useIdleReady } from "@/components/semantic/use-idle-ready";

import { bindRowHover } from "./row-hover";
import { SiteSymbol } from "./site-symbol";

/* The glyph chunk (three.js) loads only once the browser is idle, and never at T0. */
const load = () => import("@/flavors/survey/components/scene/glyphs/monument");

const posterClass =
  "absolute inset-0 size-full transition-opacity duration-(--duration-ui) group-data-live:opacity-0";
const hostClass =
  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-(--duration-ui) group-data-live:opacity-100";

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
  const glyph = React.useRef<Monument | null>(null);
  const ready = useIdleReady(2500);
  const scene = usePrefs().scene;

  React.useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!ready || !root || !host) return;
    const tier = detectTier();
    if (tier === 0) return;
    let cancelled = false;
    const poster = () => {
      delete root.dataset.live;
    };
    const live = () => {
      root.dataset.live = "";
    };
    void load().then(({ attachMonument }) => {
      if (cancelled) return;
      glyph.current = attachMonument(host, status, {
        tier,
        onLost: poster,
        onRestored: live,
      });
      live();
    });
    return () => {
      cancelled = true;
      glyph.current?.detach();
      glyph.current = null;
      poster();
    };
  }, [ready, scene, status]);

  const lean = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    glyph.current?.lean(
      ((event.clientX - box.left) / box.width) * 2 - 1,
      ((event.clientY - box.top) / box.height) * 2 - 1
    );
  };

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="monument"
      data-cursor="Turn"
      onPointerDown={(event) => {
        if (event.button !== 0 || !glyph.current) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        glyph.current.grab(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          glyph.current?.drag(event.clientX);
        } else lean(event);
      }}
      onPointerUp={() => glyph.current?.release()}
      onPointerCancel={() => glyph.current?.release()}
      onPointerLeave={() => glyph.current?.lean(0, 0)}
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
 * and hands over to the printed symbol again, so only hovered rows ever
 * draw, and never more than the engine's four at once.
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
  const ready = useIdleReady(2500);
  const scene = usePrefs().scene;

  React.useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    const row = root?.closest("li");
    if (!ready || !root || !host || !row) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const tier = detectTier();
    if (tier === 0) return;
    let cancelled = false;
    let attach: typeof attachMonument | null = null;
    void load().then((module) => {
      if (!cancelled) attach = module.attachMonument;
    });
    const unbind = bindRowHover({
      row,
      root,
      open: (hooks) => attach?.(host, status, { tier, ...hooks }) ?? null,
    });
    return () => {
      cancelled = true;
      unbind();
    };
  }, [ready, scene, status]);

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
