"use client";

import { SlidersHorizontal } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { CustomizeControls } from "./customize-controls";

/** Header button that opens the preferences popover. */
export function CustomizePanel() {
  return (
    <Popover>
      <PopoverTrigger data-customize render={<IconButton label="Customize" />}>
        <SlidersHorizontal aria-hidden strokeWidth={1.75} />
      </PopoverTrigger>
      <PopoverContent
        data-customize
        data-lenis-prevent
        className="w-[min(21rem,calc(100vw-1.5rem))]"
      >
        <CustomizeControls />
      </PopoverContent>
    </Popover>
  );
}
