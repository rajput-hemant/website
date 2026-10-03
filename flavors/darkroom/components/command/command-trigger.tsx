"use client";

import { Kbd } from "@/flavors/darkroom/components/ui/kbd";

import { ShortcutLabel } from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

import { markPointerOpen } from "./open-source";

const preloadDialog = () => void import("./command-dialog");

/** Opens ⌘K. Hovering or focusing it warms the dialog's chunk. */
export function CommandTrigger() {
  const commandTrigger = useCommandTrigger();
  return (
    <button
      type="button"
      aria-label="Search"
      aria-keyshortcuts="Meta+K Control+K /"
      title="Search (⌘K or Ctrl K)"
      {...commandTrigger}
      onClick={(event) => {
        // A real click (not Enter or Space on the button) may animate the open.
        if (event.detail > 0) markPointerOpen();
        commandTrigger.onClick(event);
      }}
      onPointerEnter={preloadDialog}
      onFocus={preloadDialog}
      className="press flex h-11 min-w-11 items-center justify-center gap-2 px-2 text-soft transition-[color,scale] duration-(--duration-ui) fine:hover:text-ink"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-4 fill-none stroke-current stroke-[1.6] fine:hidden"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5 14 14" />
      </svg>
      <Kbd aria-hidden className="hidden fine:inline-flex">
        <ShortcutLabel />
      </Kbd>
    </button>
  );
}
