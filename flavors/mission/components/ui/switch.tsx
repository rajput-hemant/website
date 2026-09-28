"use client";

import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

/** An on/off toggle with its label: the thumb lifts to the signal side when on. */
export function Switch({
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  const descriptionId = React.useId();
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-between gap-4",
        className
      )}
    >
      <span className="grid gap-0.5">
        <span className="font-medium">{label}</span>
        {description ? (
          <span id={descriptionId} className="text-sm text-ink-soft">
            {description}
          </span>
        ) : null}
      </span>
      <BaseSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby={description ? descriptionId : undefined}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-rule-strong transition-colors duration-(--duration-ui) ease-out after:absolute after:-inset-2 data-checked:border-signal data-checked:bg-signal"
      >
        <BaseSwitch.Thumb className="block size-4 translate-x-[3px] rounded-full bg-ink-soft transition-[translate,background-color] duration-(--duration-ui) ease-out data-checked:translate-x-[23px] data-checked:bg-ground" />
      </BaseSwitch.Root>
    </label>
  );
}
