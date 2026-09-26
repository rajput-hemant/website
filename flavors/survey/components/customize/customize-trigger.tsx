"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { IconButton } from "@/flavors/survey/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

import { useMediaQuery } from "@/components/semantic/use-media-query";

const CustomizePanel = dynamic(
  () => import("./customize-panel").then((mod) => mod.CustomizePanel),
  { ssr: false }
);

export type CustomizeTriggerProps = {
  className?: string;
};

/**
 * Header button for the preferences panel: a popover on desktop, a bottom
 * sheet on mobile. `null` until first opened, so the panel's chunk (Base UI)
 * loads only when asked for.
 */
export function CustomizeTrigger({ className }: CustomizeTriggerProps) {
  const [open, setOpen] = React.useState<boolean | null>(null);
  const desktop = useMediaQuery("(min-width: 640px)");
  const anchor = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <IconButton
        ref={anchor}
        label="Customize"
        aria-haspopup="dialog"
        aria-expanded={open === true}
        onClick={() => setOpen((value) => !value)}
        className={className}
      >
        <SlidersHorizontal aria-hidden strokeWidth={1.75} />
      </IconButton>
      {open !== null && (
        <CustomizePanel
          desktop={desktop}
          open={open}
          onOpenChange={setOpen}
          anchor={anchor}
        />
      )}
    </>
  );
}
