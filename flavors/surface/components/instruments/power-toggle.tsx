"use client";

import { cn } from "@/flavors/surface/lib/utils";

import { Levers } from "./toggles";

const LAYOUT = { count: 1, axis: "y", pitch: 40 } as const;

/**
 * The stage's power toggle: a real switch (the lever is its aria-hidden
 * face) that runs or stops the experiment. Up is on.
 */
export function PowerToggle({
  on,
  onChange,
  className,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Experiment power"
      data-voice="slide"
      onClick={() => onChange(!on)}
      className={cn(
        "grid cursor-pointer justify-items-center gap-1 rounded-[6px] px-1.5 pt-1 pb-1.5 outline-offset-2",
        className
      )}
    >
      <span aria-hidden className="legend text-[0.5625rem]">
        {on ? "On" : "Off"}
      </span>
      <Levers
        name="lab-power"
        layout={LAYOUT}
        positions={[on ? 1 : -1]}
        width={40}
        height={44}
      />
      <span aria-hidden className="legend text-[0.5625rem]">
        Power
      </span>
    </button>
  );
}
