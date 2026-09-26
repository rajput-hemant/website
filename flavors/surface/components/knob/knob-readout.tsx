"use client";

import { pad2, Seg } from "@/flavors/surface/components/ui/seg";
import { shownIndex, useKnob } from "@/flavors/surface/lib/knob/store";
import { cn } from "@/flavors/surface/lib/utils";

import type { KnobItem } from "./knob";

/**
 * The LCD beside a page's knob: which detent it points at, of how many, and
 * the name of what's there in dot matrix. Server-renders the first item.
 */
export function KnobReadout({
  items,
  unit,
  initial = 0,
  className,
}: {
  items: readonly KnobItem[];
  /** What a detent is called here: "Preset", "Track", "Section". */
  unit: string;
  initial?: number;
  className?: string;
}) {
  const live = useKnob((s) => s.count === items.length);
  const shown = useKnob(shownIndex);
  const i = live ? Math.min(shown, items.length - 1) : initial;

  return (
    <div className={cn("glass px-4 pt-2.5 pb-3", className)}>
      <div className="flex items-end gap-5">
        <div>
          <p className="legend mb-1.5 text-[0.59375rem]">{unit}</p>
          <Seg value={pad2(i + 1)} className="h-9" />
        </div>
        <div>
          <p className="legend mb-1.5 text-[0.59375rem]">Of</p>
          <Seg value={pad2(items.length)} className="h-9" />
        </div>
      </div>
      <p className="matrix mt-2.5 truncate border-t border-lcd-ink-2/35 pt-2 text-[0.875rem] leading-tight">
        {items[i]?.label}
      </p>
    </div>
  );
}
