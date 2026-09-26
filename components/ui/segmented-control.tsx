"use client";

import * as React from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

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
        "inline-flex gap-0.5 rounded-md border border-hairline bg-ink-sunken p-0.5",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "relative flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-sm px-3 font-mono text-mono-xs tracking-[0.1em] text-graphite uppercase",
            "motion:transition-colors motion:duration-(--duration-ui)",
            "has-[[data-checked]]:bg-ink-raised has-[[data-checked]]:text-paper has-[[data-checked]]:shadow-lift",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
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
