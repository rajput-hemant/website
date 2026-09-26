"use client";

import * as React from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  /** Accessible name when `label` is not plain text. */
  ariaLabel?: string;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  itemClassName?: string;
};

/** A single-choice group (radio semantics, arrow-key navigation) drawn as segments. */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  itemClassName,
  ...aria
}: SegmentedControlProps<T>) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next: T) => onValueChange(next)}
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-0.5 rounded-(--radius) border border-border bg-surface p-0.5",
        className
      )}
      {...aria}
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          aria-label={option.ariaLabel}
          className={cn(
            "hit-area flex h-7 min-w-0 items-center justify-center gap-1.5 rounded-[max(0px,calc(var(--radius)-2px))] px-1.5 text-xs text-muted transition-[background-color,color,box-shadow,scale] duration-(--duration-exit) select-none hover:text-foreground focus-visible:outline-offset-1 data-checked:bg-background data-checked:text-foreground data-checked:shadow-[0_0_0_1px_var(--color-border),0_1px_2px_oklch(0.3_0.03_60/0.08)] [&_svg]:size-3.5 [&_svg]:shrink-0",
            itemClassName
          )}
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
