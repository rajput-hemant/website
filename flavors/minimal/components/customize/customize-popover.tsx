"use client";

import { IconButton } from "@/flavors/minimal/components/ui/icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/flavors/minimal/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";

import { CustomizeControls } from "./customize-controls";

export type CustomizePopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** The loaded panel: Base UI popover around the controls. */
export function CustomizePopover({
  open,
  onOpenChange,
}: CustomizePopoverProps) {
  return (
    <Popover open={open} onOpenChange={(next) => onOpenChange(next)}>
      <PopoverTrigger
        data-customize
        render={
          <IconButton
            label="Customize"
            className="transition-[background-color,color,scale]"
          />
        }
      >
        <SlidersHorizontal aria-hidden strokeWidth={1.75} />
      </PopoverTrigger>
      <PopoverContent
        data-customize
        data-lenis-prevent
        className="w-[min(24rem,calc(100vw-1.5rem))]"
      >
        <CustomizeControls />
      </PopoverContent>
    </Popover>
  );
}
