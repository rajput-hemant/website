"use client";

import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

import { useInstrument } from "./use-instrument";

/**
 * A thermal paper roll with `feed` millimetres of paper out of it (its own
 * scale: 20mm curls well clear of the roll). The printed roll is its poster.
 */
export function PaperRoll({
  feed,
  className,
}: {
  feed: number;
  className?: string;
}) {
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/roll").then((m) => {
      const roll = m.attachRoll(host, options);
      roll.feed(feed);
      return roll;
    })
  );

  React.useEffect(() => {
    handle.current?.feed(feed);
  }, [feed, handle]);

  return (
    <span
      ref={rootRef}
      aria-hidden
      className={cn("relative block h-11 w-14 shrink-0", className)}
    >
      <span
        data-bench-poster
        className="absolute inset-x-1.5 top-[3px] h-[18px] rounded-[9px] bg-[#f1eee6] shadow-[inset_0_-4px_5px_rgb(0_0_0/0.18),0_0_0_1px_rgb(0_0_0/0.12)] dark:bg-[#cfcabd]"
      />
      <span
        ref={hostRef}
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
    </span>
  );
}
