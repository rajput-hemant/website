"use client";

import * as React from "react";
import { Dialog } from "@/flavors/survey/components/ui/dialog";
import { Popover } from "@/flavors/survey/components/ui/popover";

import { CustomizeControls } from "./customize-controls";

export type CustomizePanelProps = {
  desktop: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchor: React.RefObject<HTMLButtonElement | null>;
};

/**
 * The preferences surface (pulls in Base UI): a popover under the header
 * button on desktop, a bottom sheet on mobile. Loaded on first open only.
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
        className="w-[min(25rem,calc(100vw-1.5rem))]"
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
      className="p-0 pb-[env(safe-area-inset-bottom)] [&>div:first-child]:absolute [&>div:first-child]:top-2 [&>div:first-child]:right-2 [&>div:last-child]:mt-0"
    >
      <CustomizeControls />
    </Dialog>
  );
}
