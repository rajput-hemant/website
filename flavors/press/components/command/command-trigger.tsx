"use client";

import * as React from "react";
import { Kbd } from "@/flavors/press/components/ui/kbd";

import {
  isApplePlatform,
  ShortcutLabel,
} from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};
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
        <ShortcutLabel />
      </Kbd>
    </button>
  );
}
