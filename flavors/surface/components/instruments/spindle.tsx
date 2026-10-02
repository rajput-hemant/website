"use client";

import * as React from "react";
import {
  knobStore,
  shownIndex,
  useKnob,
} from "@/flavors/surface/lib/knob/store";
import { knobSounds } from "@/flavors/surface/lib/sound/detents";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

/** Pixels of drag that wind the paper one notch. */
const PER_NOTCH = 18;

/**
 * The Now module's paper spindle: it advances a notch per log detent the
 * knob turns through. Dragging it up or down with a mouse winds the paper,
 * which turns the knob (a second way to turn it); touch scrolls past it.
 */
export function LogSpindle({
  count,
  className,
}: {
  /** The knob's detents: Now, then each log year. */
  count: number;
  className?: string;
}) {
  const live = useKnob((s) => s.count === count);
  const shown = useKnob(shownIndex);
  const at = live ? shown : 0;
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/spindle").then((m) =>
      m.attachSpindle(host, options, shownIndex(knobStore.getState()))
    )
  );

  React.useEffect(() => {
    handle.current?.to(at);
  }, [at, handle]);

  const wind = React.useRef<{ id: number; y: number; from: number } | null>(
    null
  );

  return (
    <span
      ref={rootRef}
      aria-hidden
      data-cursor={count > 1 ? "Wind" : undefined}
      onPointerDown={(event) => {
        if (event.pointerType === "touch" || event.button !== 0) return;
        if (count < 2 || !handle.current) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        wind.current = {
          id: event.pointerId,
          y: event.clientY,
          from: knobStore.getState().index,
        };
      }}
      onPointerMove={(event) => {
        const w = wind.current;
        if (!w || w.id !== event.pointerId) return;
        const n = Math.min(
          Math.max(w.from + Math.round((event.clientY - w.y) / PER_NOTCH), 0),
          count - 1
        );
        if (n === knobStore.getState().index) return;
        knobSounds.detent(n, count);
        knobStore.setState({ index: n, preview: null });
      }}
      onPointerUp={() => {
        if (!wind.current) return;
        wind.current = null;
        document
          .querySelector(`[data-knob-item="${knobStore.getState().index}"]`)
          ?.scrollIntoView({
            block: "center",
            behavior:
              document.documentElement.dataset.motion === "on"
                ? "smooth"
                : "auto",
          });
      }}
      onPointerCancel={() => {
        wind.current = null;
      }}
      className={cn(
        "relative block h-9 select-none",
        count > 1 && "cursor-ns-resize",
        className
      )}
    >
      <span data-bench-poster className="absolute inset-x-0 top-0 h-full">
        <span className="absolute inset-x-3 top-[5px] h-[22px] rounded-[4px] bg-[#f1eee6] bg-[repeating-linear-gradient(90deg,transparent_0_14px,rgb(0_0_0/0.06)_14px_16px)] shadow-[inset_0_-4px_6px_rgb(0_0_0/0.18)] dark:bg-[#cfcabd]" />
      </span>
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
    </span>
  );
}
