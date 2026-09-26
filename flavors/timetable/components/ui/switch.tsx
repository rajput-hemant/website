"use client";

import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

export type SwitchProps = {
  /** Omit when an external element already labels the switch (pass `aria-labelledby` instead). */
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

export function Switch({
  label,
  description,
  className,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SwitchProps) {
  const descriptionId = React.useId();

  const control = (
    <BaseSwitch.Root
      aria-describedby={description ? descriptionId : ariaDescribedBy}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full bg-rule-strong/35 after:absolute after:-inset-2",
        "motion:transition-colors motion:duration-(--duration-ui)",
        "data-[checked]:bg-ink",
        !label && className
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        className={cn(
          "block size-5.5 translate-x-[3px] rounded-full bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.3)]",
          "motion:transition-transform motion:duration-(--duration-ui) motion:ease-enter",
          "data-[checked]:translate-x-[23px] data-[checked]:bg-signal"
        )}
      />
    </BaseSwitch.Root>
  );

  if (!label) return control;

  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-between gap-4",
        className
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-bold text-ink">{label}</span>
        {description ? (
          <span id={descriptionId} className="text-sm text-ink-soft">
            {description}
          </span>
        ) : null}
      </span>
      {control}
    </label>
  );
}
