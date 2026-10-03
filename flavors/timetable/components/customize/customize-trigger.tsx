"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { IconButton } from "@/flavors/timetable/components/ui";
import { SlidersHorizontal } from "lucide-react";

import { useMediaQuery } from "@/components/semantic/use-media-query";
import { useTriggerToggle } from "@/components/semantic/use-trigger-toggle";

const CustomizePanel = dynamic(
  () => import("./customize-panel").then((mod) => mod.CustomizePanel),
  { ssr: false }
);

export type CustomizeTriggerProps = {
  className?: string;
};

/**
 * Header button that opens the preferences panel: a popover anchored to the
 * button on desktop, a full dialog sheet on mobile (a popover has nowhere
 * good to sit next to a thumb-width header icon there).
 *
 * The panel (Base UI) loads on first open only; `null` until then, so
 * nothing past this file loads before the visitor asks for it.
 */
export function CustomizeTrigger({ className }: CustomizeTriggerProps) {
  const [open, setOpen] = React.useState<boolean | null>(null);
  const desktop = useMediaQuery("(min-width: 640px)");
  const anchor = React.useRef<HTMLButtonElement>(null);
  const toggle = useTriggerToggle(open === true, setOpen);

  return (
    <>
      <IconButton
        ref={anchor}
        label="Customize"
        aria-haspopup="dialog"
        aria-expanded={open === true}
        {...toggle}
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
