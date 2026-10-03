"use client";

import { cn } from "@/flavors/surface/lib/utils";

import { ShortcutLabel } from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

const preloadDialog = () => void import("./command-dialog");

/**
 * The ⌘K key. Hovering or focusing it warms the dialog's chunk. It keeps the
 * width of "Ctrl K" so the swap from the server's "⌘K" shifts nothing.
 */
export function CommandTrigger({ className }: { className?: string }) {
  const commandTrigger = useCommandTrigger();

  return (
    <button
      type="button"
      aria-label="Search"
      aria-keyshortcuts="Meta+K Control+K /"
      title="Search (⌘K or Ctrl K)"
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
