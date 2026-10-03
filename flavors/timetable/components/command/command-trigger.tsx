"use client";

import { IconButton, Kbd } from "@/flavors/timetable/components/ui";
import { cn } from "@/flavors/timetable/lib/utils";
import { Search } from "lucide-react";

import { ShortcutLabel } from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

const preloadDialog = () => void import("./command-dialog");

export type CommandTriggerProps = {
  /** "header" shows the ⌘K/Ctrl K hint on fine pointers; "dock" is icon-only, for the mobile bar. */
  variant?: "header" | "dock";
  className?: string;
};

/** Opens the ⌘K menu, silently. Hovering or focusing it warms the dialog's chunk. */
export function CommandTrigger({
  variant = "header",
  className,
}: CommandTriggerProps) {
  const commandTrigger = useCommandTrigger();

  if (variant === "dock") {
    return (
      <IconButton
        label="Search"
        {...commandTrigger}
        onPointerEnter={preloadDialog}
        onFocus={preloadDialog}
        data-voice="none"
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
      aria-keyshortcuts="Meta+K Control+K /"
      title="Search (⌘K or Ctrl K)"
      data-voice="none"
      {...commandTrigger}
      onPointerEnter={preloadDialog}
      onFocus={preloadDialog}
      className={cn(
        "press flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-on-sign transition-colors duration-(--duration-ui) ease-enter fine:hover:text-signal",
        className
      )}
    >
      <Search aria-hidden strokeWidth={1.75} className="size-4" />
      <Kbd
        aria-hidden
        className="hidden border-on-sign-soft text-on-sign-soft fine:inline-flex"
      >
        <ShortcutLabel />
      </Kbd>
    </button>
  );
}
