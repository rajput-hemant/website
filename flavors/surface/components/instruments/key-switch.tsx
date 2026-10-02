"use client";

import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

/**
 * The owner's key switch: the key stands at Locked and turns a quarter to
 * Open once signed in; `shake` (bump it per error) rattles it. Decorative:
 * the form and its messages say the same. The printed lock is its poster.
 */
export function KeySwitch({
  open,
  shake,
  className,
}: {
  open: boolean;
  /** A counter: each new value shakes the key once. */
  shake: number;
  className?: string;
}) {
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/keyswitch").then(
      (m) => m.attachKeySwitch(host, options, open)
    )
  );

  React.useEffect(() => {
    handle.current?.set(open);
  }, [handle, open]);
  React.useEffect(() => {
    if (shake > 0) handle.current?.shake();
  }, [handle, shake]);

  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-24 shrink-0 place-items-center",
        className
      )}
    >
      <span
        className={cn(
          "legend absolute top-0 left-1/2 -translate-x-1/2 text-[0.5625rem] transition-colors duration-150",
          open ? "text-ink-2" : "text-ink"
        )}
      >
        Locked
      </span>
      <span
        className={cn(
          "legend absolute top-1/2 right-0 -translate-y-1/2 text-[0.5625rem] transition-colors duration-150",
          open ? "text-ink" : "text-ink-2"
        )}
      >
        Open
      </span>
      <span ref={rootRef} className="relative block size-16">
        <svg
          viewBox="-50 -50 100 100"
          data-bench-poster
          className="absolute inset-0 size-full"
        >
          <circle r="34" className="fill-ink-3" />
          <circle r="21" className="fill-plate-lo" />
          <rect
            x="-4"
            y="-26"
            width="8"
            height="52"
            rx="3"
            className="fill-ink"
            style={{
              transform: `rotate(${open ? 90 : 0}deg)`,
              transition: "transform 300ms var(--ease-detent)",
            }}
          />
        </svg>
        <span
          ref={hostRef}
          data-bench-host
          className="pointer-events-none absolute inset-0"
        />
      </span>
    </span>
  );
}
