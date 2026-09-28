"use client";

import * as React from "react";
import { cn } from "@/flavors/maquette/lib/utils";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

/** An on/off rocker, like the desk lamp's own switch, with its label. */
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
        <span className="font-semibold">{label}</span>
        {description ? (
          <span id={descriptionId} className="text-sm text-soft">
            {description}
          </span>
        ) : null}
      </span>
      <BaseSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby={description ? descriptionId : undefined}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors duration-(--duration-ui) after:absolute after:-inset-2 data-checked:bg-cut data-checked:shadow-none"
      >
        <BaseSwitch.Thumb className="block size-4 translate-x-1 rounded-full bg-soft transition-[translate,background-color] duration-(--duration-ui) ease-out data-checked:translate-x-6 data-checked:bg-ground" />
      </BaseSwitch.Root>
    </label>
  );
}
