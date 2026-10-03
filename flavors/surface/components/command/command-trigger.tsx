"use client";

import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

import {
  isApplePlatform,
  ShortcutLabel,
} from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};

/**
 * The ⌘K key. Hovering or focusing it warms the dialog's chunk. It keeps the
 * width of "Ctrl K" so the swap from the server's "⌘K" shifts nothing.
 */
export function CommandTrigger({ className }: { className?: string }) {
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
      className={cn("key", className)}
    >
      <span aria-hidden>
        <ShortcutLabel />
      </span>
    </button>
  );
}
