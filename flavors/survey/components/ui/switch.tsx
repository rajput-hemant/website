"use client";

import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

export type SwitchProps = {
  /** Omit when an external element labels the switch (pass `aria-labelledby`). */
  label?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string | undefined;
};

export function Switch({ label, className, ...props }: SwitchProps) {
  const control = (
    <BaseSwitch.Root
      className={cn(
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-rule-strong bg-sheet after:absolute",
        // With a label, the hit area spans the whole row, so a click on the
        // text lands on the switch itself (and ClickSound hears it).
        label ? "after:inset-0" : "relative after:-inset-2.5",
        "motion:transition-colors motion:duration-(--duration-ui)",
        "data-[checked]:border-water data-[checked]:bg-water",
        !label && className
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        className={cn(
          "block size-4 translate-x-[3px] rounded-full bg-ink-soft",
          "motion:transition-transform motion:duration-(--duration-ui) motion:ease-enter",
          "data-[checked]:translate-x-[23px] data-[checked]:bg-sheet"
        )}
      />
    </BaseSwitch.Root>
  );

  if (!label) return control;
  return (
    <label
      className={cn(
        "relative flex min-h-11 cursor-pointer items-center justify-between gap-4",
        className
      )}
    >
      <span className="font-medium">{label}</span>
      {control}
    </label>
  );
}
