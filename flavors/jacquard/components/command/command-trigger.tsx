"use client";

import * as React from "react";
import { chipClass } from "@/flavors/jacquard/components/ui/button";

import { openCommandMenu } from "@/lib/command/events";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};
const isApple = () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/** Opens ⌘K from the header chip. Hovering or focusing it warms the dialog's chunk. */
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
      className={chipClass}
    >
      <span className="chip-box">{shortcut}</span>
    </button>
  );
}
