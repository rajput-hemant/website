"use client";

import * as React from "react";
import { cn } from "@/flavors/darkroom/lib/utils";
import { Popover as BasePopover } from "@base-ui/react/popover";

/** A slip of paper anchored to its trigger, growing from it. */
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
              "origin-(--transform-origin) rounded-[3px] bg-raise text-ink shadow-sheet ring-1 ring-line outline-none",
              "data-ending-style:opacity-0 data-starting-style:opacity-0 motion:transition-[opacity,scale] motion:duration-(--duration-ui) motion:ease-out motion:data-ending-style:scale-[0.97] motion:data-starting-style:scale-[0.97]",
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
