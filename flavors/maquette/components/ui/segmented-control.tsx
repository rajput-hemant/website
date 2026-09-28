"use client";

import * as React from "react";
import { cn } from "@/flavors/maquette/lib/utils";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

/** Exclusive options as a row of filter tabs; radio-group semantics. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  className,
  ...props
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onValueChange: (value: T) => void;
  "aria-labelledby"?: string;
  className?: string;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => {
        const option = options.find((entry) => entry.value === next);
        if (option) onValueChange(option.value);
      }}
      className={cn("inline-flex gap-1", className)}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="relative flex h-10 min-w-11 cursor-pointer items-center justify-center rounded-[3px] px-3 text-sm font-semibold text-soft shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors duration-(--duration-ui) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-data-checked:bg-ink has-data-checked:text-ground has-data-checked:shadow-none fine:hover:text-ink"
        >
          <Radio.Root value={option.value} className="sr-only" />
          {option.label}
        </label>
      ))}
    </RadioGroup>
  );
}
