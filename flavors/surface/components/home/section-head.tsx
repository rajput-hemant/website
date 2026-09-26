import * as React from "react";
import { Legend, LegendRow } from "@/flavors/surface/components/ui/primitives";
import { cn } from "@/flavors/surface/lib/utils";

/** A section head: channel legend over a condensed h2, with an optional readout on the right. */
export function SectionHead({
  id,
  legend,
  title,
  aside,
  className,
}: {
  id: string;
  legend: readonly React.ReactNode[];
  title: string;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "seam-b grid grid-cols-1 items-end gap-6 pb-[22px] sm:grid-cols-[1fr_auto]",
        className
      )}
    >
      <div>
        <Legend className="mb-3.5">
          <LegendRow parts={legend} />
        </Legend>
        <h2 id={id} className="text-h2 tracking-[-0.016em]">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
