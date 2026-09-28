"use client";

import * as React from "react";
import type { Layers } from "@/flavors/survey/components/scene/glyphs/layers";
import {
  hostClass,
  posterClass,
} from "@/flavors/survey/components/scene/turn-pointer";
import { useGlyph } from "@/flavors/survey/components/scene/use-glyph";
import { cn } from "@/flavors/survey/lib/utils";

/**
 * N2: the changelog's years as a stack of sheet tiles beside the year
 * links, oldest at the bottom, each as thick as its revisions. Pointing at
 * or focusing a year link (`data-year`, in the same parent) lifts its tile.
 * The flat stack is the poster and the T0 state. Decorative: the links
 * name the years.
 */
export function RevisionLayers({
  years,
  className,
}: {
  /** Newest first, as the log lists them. */
  years: { year: string; count: number }[];
  className?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const oldest = [...years].reverse();
  const counts = oldest.map((y) => y.count);
  const key = oldest.map((y) => `${y.year}:${y.count}`).join(",");
  const glyph = useGlyph<Layers>(
    rootRef,
    hostRef,
    async () => {
      const { attachLayers } =
        await import("@/flavors/survey/components/scene/glyphs/layers");
      return (host, options) =>
        attachLayers(host, counts, {
          ...options,
          aspect: host.clientWidth / Math.max(1, host.clientHeight),
        });
    },
    { key }
  );

  React.useEffect(() => {
    const scope = rootRef.current?.parentElement;
    if (!scope) return;
    const order = key.split(",").map((entry) => entry.split(":")[0]);
    const point = (event: Event) => {
      if (event instanceof PointerEvent && event.pointerType !== "mouse") {
        return;
      }
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-year]")
          : null;
      const at = link ? order.indexOf(link.dataset.year ?? "") : -1;
      glyph.current?.point(at === -1 ? null : at);
    };
    const clear = () => glyph.current?.point(null);
    const links = scope.querySelectorAll<HTMLElement>("[data-year]");
    for (const link of links) {
      link.addEventListener("pointerenter", point);
      link.addEventListener("focus", point);
      link.addEventListener("pointerleave", clear);
      link.addEventListener("blur", clear);
    }
    return () => {
      for (const link of links) {
        link.removeEventListener("pointerenter", point);
        link.removeEventListener("focus", point);
        link.removeEventListener("pointerleave", clear);
        link.removeEventListener("blur", clear);
      }
    };
  }, [key, glyph]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-glyph="layers"
      className={cn("group relative aspect-[7/5] w-35 shrink-0", className)}
    >
      <svg viewBox="0 0 140 100" className={posterClass}>
        {oldest.map((y, i) => {
          const top = 78 - i * 13;
          return (
            <path
              key={y.year}
              d={`M${22 + i * 2} ${top}l48 -14l48 14l-48 14Z`}
              className={cn(
                "fill-sheet",
                i === oldest.length - 1 ? "stroke-revision" : "stroke-ink"
              )}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      <div ref={hostRef} className={hostClass} />
    </div>
  );
}
