"use client";

import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";
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
  "aria-describedby"?: string | undefined;
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
        "inline-flex h-6 w-10 shrink-0 items-center border border-line-strong bg-sheet-deep after:absolute",
        // With a label, the hit area spans the whole row, so a click on the
        // text lands on the switch itself (and ClickSound hears it).
        label ? "after:inset-0" : "relative after:-inset-2.5",
        "motion:transition-colors motion:duration-(--duration-ui)",
        "data-[checked]:border-accent data-[checked]:bg-accent-soft",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        !label && className
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        className={cn(
          "block size-4 translate-x-[3px] bg-ink-soft",
          "motion:transition-transform motion:duration-(--duration-ui) motion:ease-enter",
          "data-[checked]:translate-x-[19px] data-[checked]:bg-accent"
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
      <span className="flex flex-col gap-0.5">
        <span className="text-ink">{label}</span>
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
