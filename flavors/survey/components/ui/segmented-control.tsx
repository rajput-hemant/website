"use client";

import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

export type SegmentedControlOption = { label: React.ReactNode; value: string };

/** Exclusive options as a row of printed tabs; radio-group semantics. */
export function SegmentedControl({
  options,
  className,
  ...props
}: {
  options: SegmentedControlOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  "aria-labelledby"?: string;
  className?: string;
}) {
  return (
    <RadioGroup
      className={cn("inline-flex border border-rule", className)}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "relative flex h-10 min-w-11 cursor-pointer items-center justify-center gap-1.5 border-r border-rule px-3 text-sm font-medium text-ink-soft last:border-r-0 fine:hover:text-ink",
            "motion:transition-colors motion:duration-(--duration-ui)",
            "has-[[data-checked]]:bg-ink has-[[data-checked]]:text-sheet",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-water"
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
