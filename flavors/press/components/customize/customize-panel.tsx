"use client";

import * as React from "react";
import { Dialog } from "@/flavors/press/components/ui/dialog";
import { Popover } from "@/flavors/press/components/ui/popover";

import { CustomizeControls } from "./customize-controls";

export function CustomizePanel({
  desktop,
  open,
  onOpenChange,
  anchor,
}: {
  desktop: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchor: React.RefObject<HTMLButtonElement | null>;
}) {
  return desktop ? (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      anchor={anchor}
      className="w-[min(23rem,calc(100vw-1.5rem))]"
    >
      <CustomizeControls />
    </Popover>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange} title="Customize">
      <CustomizeControls />
    </Dialog>
  );
}
