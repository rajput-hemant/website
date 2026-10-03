"use client";

import { chipClass } from "@/flavors/jacquard/components/ui/button";

import { ShortcutLabel } from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

const preloadDialog = () => void import("./command-dialog");

/** Opens ⌘K from the header chip. Hovering or focusing it warms the dialog's chunk. */
export function CommandTrigger() {
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
      className={chipClass}
    >
      <span className="chip-box inline-block text-center">
        <ShortcutLabel />
      </span>
    </button>
  );
}
