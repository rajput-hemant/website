"use client";

import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

import { OPEN_COMMAND_EVENT } from "@/lib/command/events";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};
const isApple = () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/**
 * The ⌘K key. Hovering or focusing it warms the dialog's chunk. It keeps the
 * width of "Ctrl K" so the swap from the server's "⌘K" shifts nothing.
 */
export function CommandTrigger({ className }: { className?: string }) {
  const apple = React.useSyncExternalStore(subscribeNever, isApple, () => true);
  const shortcut = apple ? "⌘K" : "Ctrl K";

  return (
    <button
      type="button"
      aria-label="Search"
      aria-keyshortcuts={apple ? "Meta+K /" : "Control+K /"}
      title={`Search (${shortcut})`}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent(OPEN_COMMAND_EVENT, { detail: { pointer: true } })
        )
      }
      onPointerEnter={preloadDialog}
      onFocus={preloadDialog}
      className={cn("key min-w-[4.6rem]", className)}
    >
      <span aria-hidden>{shortcut}</span>
    </button>
  );
}
