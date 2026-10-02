"use client";

import * as React from "react";
import { shownIndex, useKnob } from "@/flavors/surface/lib/knob/store";
import { cn } from "@/flavors/surface/lib/utils";

import { usePendingThreads } from "@/components/semantic/ask/pending-messages";

import { useInstrument } from "./use-instrument";

/**
 * An LED bar-graph: a segment per item, lit from real data. The printed
 * segments are the poster; the 3D ones fade like the lamps.
 */
export function Bargraph({
  name,
  lit,
  className,
}: {
  name: string;
  lit: readonly boolean[];
  className?: string | undefined;
}) {
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/bargraph").then(
      (m) => m.attachBargraph(host, options, name, lit)
    )
  );
  const key = lit.map((on) => (on ? 1 : 0)).join("");

  React.useEffect(() => {
    handle.current?.light([...key].map((c) => c === "1"));
  }, [handle, key]);

  return (
    <span
      ref={rootRef}
      aria-hidden
      className={cn("relative block h-2.5 select-none", className)}
    >
      <span
        data-bench-poster
        className="absolute inset-0 flex gap-0.5 rounded-[3px] bg-plate-lo p-0.5"
      >
        {lit.map((on, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-[1px] transition-colors duration-150",
              on ? "bg-signal" : "bg-led-off"
            )}
          />
        ))}
      </span>
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
    </span>
  );
}

/**
 * The spec sheet's bar-graph: a segment per preset, the one the knob shows
 * lit, so hovering the knob's detents previews it.
 */
export function PresetBargraph({
  total,
  initial,
  className,
}: {
  total: number;
  initial: number;
  className?: string;
}) {
  const live = useKnob((s) => s.count === total);
  const shown = useKnob(shownIndex);
  const at = live ? shown : initial;
  return (
    <Bargraph
      name="preset"
      lit={Array.from({ length: total }, (_, i) => i === at)}
      className={className}
    />
  );
}

/** Segments on the queue graph; more pending messages than this keep them all lit. */
const QUEUE = 12;

/**
 * The Ask queue: a segment for each of this browser's messages waiting for
 * approval, so a new filing lights the next one.
 */
export function QueueBargraph({
  publishedSlugs,
  className,
}: {
  publishedSlugs: readonly string[];
  className?: string;
}) {
  const pending = usePendingThreads(publishedSlugs).length;
  return (
    <Bargraph
      name="queue"
      lit={Array.from({ length: QUEUE }, (_, i) => i < pending)}
      className={className}
    />
  );
}
