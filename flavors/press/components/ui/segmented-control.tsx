"use client";

import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

/** Exclusive options as a row of stamps; radio-group semantics. */
export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
  ...props
}: {
  options: { value: string; label: React.ReactNode }[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-labelledby"?: string;
  className?: string;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onValueChange(String(next))}
      className={cn("inline-flex gap-1", className)}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="relative flex h-10 min-w-11 cursor-pointer items-center justify-center gap-1.5 px-3 text-sm font-bold text-ink-soft shadow-[inset_0_0_0_1px_var(--color-rule)] transition-colors duration-(--duration-ui) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-data-checked:bg-blue has-data-checked:text-paper has-data-checked:shadow-none fine:hover:text-ink [&_svg]:size-3.5"
        >
          <Radio.Root value={option.value} className="sr-only" />
          {option.label}
        </label>
      ))}
    </RadioGroup>
  );
}
