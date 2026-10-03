"use client";

import * as React from "react";
import { chipClass } from "@/flavors/jacquard/components/ui/button";

import {
  isApplePlatform,
  ShortcutLabel,
} from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};

/** Opens ⌘K from the header chip. Hovering or focusing it warms the dialog's chunk. */
export function CommandTrigger() {
  const apple = React.useSyncExternalStore(
    subscribeNever,
    isApplePlatform,
    () => true
  );
  const commandTrigger = useCommandTrigger();
  const shortcut = apple ? "⌘K" : "Ctrl K";
  return (
    <button
      type="button"
      aria-label="Search"
      aria-keyshortcuts={apple ? "Meta+K /" : "Control+K /"}
      title={`Search (${shortcut})`}
      {...commandTrigger}
      onPointerEnter={preloadDialog}
      onFocus={preloadDialog}
      className={chipClass}
    >
      <span className="chip-box inline-block text-center">
        <ShortcutLabel />
      </span>
    </button>
  );
}
