"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal } from "lucide-react";

import { OPEN_CUSTOMIZE_EVENT } from "@/components/command/command-events";
import { IconButton } from "@/components/ui/icon-button";

const loadPopover = () => import("./customize-popover");

/** The trigger as it looks before the popover code arrives. */
function TriggerShell({ onOpen }: { onOpen?: () => void }) {
  return (
    <IconButton
      label="Customize"
      data-customize
      aria-haspopup="dialog"
      aria-expanded={false}
      onClick={onOpen}
      onPointerEnter={() => void loadPopover()}
      onFocus={() => void loadPopover()}
      className="transition-[background-color,color,scale]"
    >
      <SlidersHorizontal aria-hidden strokeWidth={1.75} />
    </IconButton>
  );
}

const CustomizePopover = dynamic(
  () => loadPopover().then((mod) => mod.CustomizePopover),
  { ssr: false, loading: () => <TriggerShell /> }
);

/**
 * Header button that opens the preferences popover. The popover (Base UI and
 * its positioning code) stays out of the initial bundle: hovering or focusing
 * the button warms the chunk, and the first click or a "Customize" command
 * from the ⌘K menu mounts it already open.
 */
export function CustomizePanel() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onOpen = () => {
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CUSTOMIZE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CUSTOMIZE_EVENT, onOpen);
  }, []);

  if (!mounted) {
    return (
      <TriggerShell
        onOpen={() => {
          setMounted(true);
          setOpen(true);
        }}
      />
    );
  }

  return <CustomizePopover open={open} onOpenChange={setOpen} />;
}
