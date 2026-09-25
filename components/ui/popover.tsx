"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverTitle = PopoverPrimitive.Title;

export type PopoverContentProps = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "collisionPadding"
  >;

/** Portal, positioner and popup in one: a solid panel with a hairline border. */
export function PopoverContent({
  className,
  side = "bottom",
  align = "end",
  sideOffset = 10,
  collisionPadding = 12,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          className={cn(
            "max-h-(--available-height) origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-lg border border-border bg-background font-sans text-foreground shadow-popover transition-[opacity,scale,translate] duration-200 ease-snappy outline-none data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}
