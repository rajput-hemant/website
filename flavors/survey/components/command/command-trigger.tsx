"use client";

import * as React from "react";
import { IconButton } from "@/flavors/survey/components/ui/button";
import { Kbd } from "@/flavors/survey/components/ui/kbd";
import { cn } from "@/flavors/survey/lib/utils";
import { Search } from "lucide-react";

import {
  isApplePlatform,
  ShortcutLabel,
} from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};

export type CommandTriggerProps = {
  /** "header" shows the ⌘K/Ctrl K hint on fine pointers; "dock" is icon-only, for the mobile bar. */
  variant?: "header" | "dock";
  className?: string;
};

/** Opens the ⌘K menu. Hovering or focusing it warms the dialog's chunk. */
export function CommandTrigger({
  variant = "header",
  className,
}: CommandTriggerProps) {
  const apple = React.useSyncExternalStore(
    subscribeNever,
    isApplePlatform,
    () => true
  );
  const commandTrigger = useCommandTrigger();
  const shortcut = apple ? "⌘K" : "Ctrl K";

  if (variant === "dock") {
    return (
      <IconButton
        label="Search"
        {...commandTrigger}
        data-voice="none"
        onPointerEnter={preloadDialog}
        onFocus={preloadDialog}
        className={className}
      >
        <Search aria-hidden strokeWidth={1.75} />
      </IconButton>
    );
  }

  return (
    <button
      type="button"
      aria-label="Search"
      aria-keyshortcuts={apple ? "Meta+K /" : "Control+K /"}
      title={`Search (${shortcut})`}
      {...commandTrigger}
      data-voice="none"
      onPointerEnter={preloadDialog}
      onFocus={preloadDialog}
      className={cn(
        "press flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-ink-soft transition-colors duration-(--duration-ui) ease-enter fine:hover:text-water",
        className
      )}
    >
      <Search aria-hidden strokeWidth={1.75} className="size-4" />
      <Kbd className="hidden text-ink-faint fine:inline-flex">
        <ShortcutLabel />
      </Kbd>
    </button>
  );
}
