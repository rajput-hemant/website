"use client";

import * as React from "react";
import { Dialog } from "@/flavors/drawing-set/components/ui/dialog";
import { Popover } from "@/flavors/drawing-set/components/ui/popover";

import { CustomizeControls } from "./customize-controls";

export type CustomizePanelProps = {
  desktop: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchor: React.RefObject<HTMLButtonElement | null>;
};

/**
 * The actual preferences surface (pulls in Base UI): a popover anchored to
 * the header button on desktop, a full dialog sheet on mobile. Loaded only
 * after the trigger is first opened, so Base UI never ships in the initial
 * bundle of a page that never touches Customize.
 */
export function CustomizePanel({
  desktop,
  open,
  onOpenChange,
  anchor,
}: CustomizePanelProps) {
  if (desktop) {
    return (
      <Popover
        open={open}
        onOpenChange={onOpenChange}
        anchor={anchor}
        className="w-[min(24rem,calc(100vw-1.5rem))] p-0"
      >
        <CustomizeControls />
      </Popover>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Customize"
      hideTitle
      className="p-0"
    >
      <CustomizeControls />
    </Dialog>
  );
}
