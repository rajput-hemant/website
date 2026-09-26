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
      className={cn("inline-flex border border-line", className)}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "relative flex h-11 min-w-11 cursor-pointer items-center justify-center px-3 font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase not-first:border-l not-first:border-line fine:hover:text-ink",
            "after:absolute after:inset-x-3 after:bottom-1.5 after:h-[1.5px] after:bg-accent after:opacity-0 has-[[data-checked]]:after:opacity-100",
            "motion:transition-colors motion:duration-(--duration-ui)",
            "has-[[data-checked]]:text-ink",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-accent"
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
