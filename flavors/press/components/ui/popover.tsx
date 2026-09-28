"use client";

import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";
import { Popover as BasePopover } from "@base-ui/react/popover";

/** A slip anchored to its trigger, scaling from it. */
export function Popover({
  children,
  className,
  open,
  onOpenChange,
  anchor,
}: {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchor: React.RefObject<Element | null>;
}) {
  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange}>
      <BasePopover.Portal>
        <BasePopover.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          anchor={anchor}
          className="z-50"
        >
          <BasePopover.Popup
            className={cn(
              "origin-(--transform-origin) bg-sheet text-ink shadow-sheet ring-1 ring-rule outline-none",
              "transition-[opacity,scale] duration-(--duration-ui) ease-enter data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0",
              className
            )}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
