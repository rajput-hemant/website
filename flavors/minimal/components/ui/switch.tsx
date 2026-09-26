"use client";

import { cn } from "@/flavors/minimal/lib/utils";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

export type SwitchProps = SwitchPrimitive.Root.Props;

/** Label it by wrapping it in a <label>, or with `aria-label`. */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-[max(3px,var(--radius))] border border-border bg-surface-2 p-[2px] transition-[background-color,border-color,scale] duration-(--duration-enter) data-checked:border-accent data-checked:bg-accent data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="size-3.5 rounded-[max(2px,calc(var(--radius)-3px))] bg-subtle shadow-[0_1px_2px_oklch(0_0_0/0.15)] transition-[translate,background-color] duration-(--duration-enter) ease-enter data-checked:translate-x-4 data-checked:bg-accent-foreground" />
    </SwitchPrimitive.Root>
  );
}
