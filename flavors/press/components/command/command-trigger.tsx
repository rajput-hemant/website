"use client";

import * as React from "react";
import { Kbd } from "@/flavors/press/components/ui/kbd";

import { openCommandMenu } from "@/lib/command/events";

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
      onClick={openCommandMenu}
      onPointerEnter={preloadDialog}
      onFocus={preloadDialog}
      className="press flex h-11 min-w-11 items-center justify-center gap-2 px-2 text-ink fine:hover:text-blue"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-4 fill-none stroke-current stroke-[1.6]"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5 14 14" />
      </svg>
      <Kbd aria-hidden className="hidden fine:inline-flex">
        {shortcut}
      </Kbd>
    </button>
  );
}
