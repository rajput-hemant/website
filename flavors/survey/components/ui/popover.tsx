"use client";

import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";
import { Popover as BasePopover } from "@base-ui/react/popover";

/** A small inset sheet, anchored to the element that opened it. */
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
          anchor={anchor}
          className="z-50"
        >
          <BasePopover.Popup
            className={cn(
              "origin-(--transform-origin) border border-rule-strong bg-sheet text-ink shadow-lift",
              "motion:transition-[scale,opacity] motion:duration-(--duration-ui) motion:ease-enter",
              "data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
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
