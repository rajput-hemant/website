"use client";

import type * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

import { leanOf } from "./lamp";
import { useInstrument } from "./use-instrument";

/**
 * A brushed aluminium nameplate with rivets: the mouse leans it up to 6
 * degrees, sliding the brushing's highlight. `children` is its engraving,
 * in the DOM over the plate. The printed rating plate is its poster.
 */
export function BrushedPlate({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { rootRef, hostRef, handle } = useInstrument((host, options) =>
    import("@/flavors/surface/components/scene/instruments/plate").then((m) =>
      m.attachPlate(host, options)
    )
  );

  return (
    <span
      ref={rootRef}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const { x, y } = leanOf(event);
        handle.current?.lean(x, y);
      }}
      onPointerLeave={() => handle.current?.lean(0, 0)}
      className={cn("relative block h-14 w-36 select-none", className)}
    >
      <span
        aria-hidden
        data-bench-poster
        className="rating-plate absolute inset-[3px]"
      />
      <span
        ref={hostRef}
        aria-hidden
        data-bench-host
        className="pointer-events-none absolute inset-0"
      />
      <span className="relative flex h-full flex-col justify-center px-3.5 text-[#22221f]">
        {children}
      </span>
    </span>
  );
}
