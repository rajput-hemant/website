"use client";

import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";
import { Popover as BasePopover } from "@base-ui/react/popover";

/** A tab hung from its trigger, growing from it. */
export function Popover({
  children,
  className,
  open,
  onOpenChange,
  label,
  anchor,
}: {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Names the popup, a dialog, for assistive tech. */
  label?: string;
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
            aria-label={label}
            className={cn(
              "origin-(--transform-origin) rounded-none border border-rule-strong bg-panel text-ink shadow-card outline-none",
              "transition-[opacity,scale] duration-(--duration-ui) ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0",
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
