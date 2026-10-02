"use client";

import * as React from "react";
import {
  knobStore,
  shownIndex,
  useKnob,
} from "@/flavors/surface/lib/knob/store";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

/** Kept in step with `CARRIAGE` in the 3D part, which this chunk must not import. */
const CARRIAGE = 30;

/** Where stop `i` of `count` sits along the rail, 0 to 1. */
const stopAt = (i: number, count: number) =>
  count <= 1 ? 0.5 : i / (count - 1);

/**
 * The log's print head: a carriage on two rails over the stops the knob
 * turns through (Now, then each log year, engraved under the rail). It
 * shuttles to the knob's stop and strikes once it arrives.
 */
export function LogPrinthead({
  stops,
  className,
}: {
  stops: readonly string[];
  className?: string;
}) {
  const count = stops.length;
  const live = useKnob((s) => s.count === count);
  const shown = useKnob(shownIndex);
  const at = live ? shown : 0;
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/printhead").then(
      (m) =>
        m.attachPrinthead(
          host,
          options,
          stopAt(shownIndex(knobStore.getState()), count)
        )
    )
  );

  React.useEffect(() => {
    handle.current?.go(stopAt(at, count));
  }, [at, count, handle]);

  // The legends share the carriage's travel: half a carriage in from each end.
  const legend = (i: number) =>
    `calc(${CARRIAGE / 2}px + (100% - ${CARRIAGE}px) * ${stopAt(i, count)})`;

  return (
    <div aria-hidden className={cn("select-none", className)}>
      <span ref={rootRef} className="relative block h-10">
        <span data-bench-poster className="absolute inset-0">
          <span className="absolute inset-x-0.5 top-[13px] h-1 rounded-full bg-ink-3" />
          <span className="absolute inset-x-0.5 top-[23px] h-1 rounded-full bg-ink-3" />
          <span
            className="absolute top-2 h-6 rounded-[3px] bg-ink motion:transition-[left] motion:duration-450 motion:ease-(--ease-detent)"
            style={{
              width: CARRIAGE,
              left: `calc((100% - ${CARRIAGE}px) * ${stopAt(at, count)})`,
            }}
          />
        </span>
        <span
          ref={hostRef}
          data-bench-host
          className="pointer-events-none absolute inset-0"
        />
      </span>
      <span className="relative mt-1 block h-3">
        {stops.map((label, i) => (
          <span
            key={label}
            className={cn(
              "legend absolute -translate-x-1/2 text-[0.5625rem] whitespace-nowrap transition-colors duration-150",
              i === at ? "text-ink" : "text-ink-2"
            )}
            style={{ left: legend(i) }}
          >
            {label}
          </span>
        ))}
      </span>
    </div>
  );
}
