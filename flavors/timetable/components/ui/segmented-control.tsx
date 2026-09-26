"use client";

import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

export type SegmentedControlOption = { label: React.ReactNode; value: string };

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

/** A row of exclusive options; radio-group semantics under the hood. */
export function SegmentedControl({
  options,
  className,
  ...props
}: SegmentedControlProps) {
  return (
    <RadioGroup
      className={cn(
        "inline-flex gap-1 rounded-md bg-ground p-1 shadow-[inset_0_0_0_1.5px_var(--color-rule)]",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "relative flex h-10 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] px-3 pt-0.5 text-sm font-bold text-ink-soft fine:hover:text-ink",
            "motion:transition-colors motion:duration-(--duration-ui)",
            "has-[[data-checked]]:bg-ink has-[[data-checked]]:text-ground",
            "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-focus"
          )}
        >
          <Radio.Root value={option.value} className="sr-only">
            <Radio.Indicator className="hidden" />
          </Radio.Root>
          {option.label}
        </label>
      ))}
    </RadioGroup>
  );
}
