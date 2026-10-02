"use client";

import * as React from "react";
import { Kbd } from "@/flavors/calibre/components/ui/kbd";

import { openCommandMenu } from "@/lib/command/events";

import { markPointerOpen } from "./open-source";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};
const isApple = () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/** Opens ⌘K. Hovering or focusing it warms the dialog's chunk. */
export function CommandTrigger() {
  const apple = React.useSyncExternalStore(subscribeNever, isApple, () => true);
  const shortcut = apple ? "⌘K" : "Ctrl K";
  return (
    <button
      type="button"
      aria-label="Search"
      aria-keyshortcuts={apple ? "Meta+K /" : "Control+K /"}
      title={`Search (${shortcut})`}
      onClick={(event) => {
        // A real click (not Enter or Space on the button) may animate the open.
        if (event.detail > 0) markPointerOpen();
        openCommandMenu();
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
      <Kbd aria-hidden className="hidden min-w-[3.3rem] fine:inline-flex">
        {shortcut}
      </Kbd>
    </button>
  );
}
