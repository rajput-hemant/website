"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { IconButton } from "@/flavors/press/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

import { useMediaQuery } from "@/components/semantic/use-media-query";

const CustomizePanel = dynamic(
  () => import("./customize-panel").then((mod) => mod.CustomizePanel),
  { ssr: false }
);

/** Opens the preferences: a popover on desktop, a sheet on mobile. Loads on first open. */
export function CustomizeTrigger() {
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
