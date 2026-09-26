"use client";

import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";
import { Popover as BasePopover } from "@base-ui/react/popover";

export type PopoverProps = {
  /** Omit when the popover is controlled by an external trigger element (pass `anchor` instead). */
  trigger?: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Anchors the popup to an external element instead of an internal `trigger`. */
  anchor?: React.RefObject<Element | null>;
};

export function Popover({
  trigger,
  children,
  side = "bottom",
  className,
  open,
  onOpenChange,
  anchor,
}: PopoverProps) {
  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <BasePopover.Trigger data-magnetic className="press">
          {trigger}
        </BasePopover.Trigger>
      ) : null}
      <BasePopover.Portal>
        <BasePopover.Positioner
          side={side}
          sideOffset={8}
          anchor={anchor}
          className="z-50"
        >
          <BasePopover.Popup
            className={cn(
              "border border-line-strong bg-ground p-4 text-ink shadow-lift",
              "motion:transition-all motion:duration-(--duration-ui) motion:ease-enter",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
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
