"use client";

import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

/** Exclusive options as a row of keys, the chosen one lit; radio-group semantics. */
export function SegmentedControl<V extends string>({
  options,
  value,
  onValueChange,
  className,
  ...props
}: {
  options: readonly { value: V; label: React.ReactNode }[];
  value: V;
  onValueChange: (value: V) => void;
  "aria-labelledby"?: string;
  className?: string;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => {
        const option = options.find((o) => o.value === next);
        if (option) onValueChange(option.value);
      }}
      className={cn(
        "inline-flex rounded-none border border-rule-strong p-0.5",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="relative flex h-10 min-w-11 cursor-pointer items-center justify-center rounded-none px-3 text-sm text-ink-soft transition-colors duration-(--duration-ui) ease-out has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus has-data-checked:bg-ink has-data-checked:text-ground fine:hover:text-ink fine:has-data-checked:hover:text-ground"
        >
          <Radio.Root value={option.value} className="sr-only" />
          {option.label}
        </label>
      ))}
    </RadioGroup>
  );
}
