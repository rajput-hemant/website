"use client";

import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

/** An on/off tick box in stamp style, with its label. */
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
        <span className="font-bold">{label}</span>
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
        className="relative h-6 w-11 shrink-0 shadow-[inset_0_0_0_1.5px_var(--color-ink)] transition-colors duration-(--duration-ui) after:absolute after:-inset-2 data-checked:bg-blue"
      >
        <BaseSwitch.Thumb className="block size-4 translate-x-1 bg-ink transition-[translate,background-color] duration-(--duration-ui) ease-enter data-checked:translate-x-6 data-checked:bg-paper" />
      </BaseSwitch.Root>
    </label>
  );
}
