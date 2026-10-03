"use client";

import * as React from "react";
import { iconButtonVariants } from "@/flavors/minimal/components/ui/icon-button";
import { Kbd } from "@/flavors/minimal/components/ui/kbd";
import { cn } from "@/flavors/minimal/lib/utils";
import { Search } from "lucide-react";

import {
  isApplePlatform,
  ShortcutLabel,
} from "@/components/semantic/command/shortcut-label";
import { useCommandTrigger } from "@/components/semantic/command/use-command-trigger";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};

/** The header's search button: opens the ⌘K menu, warming its chunk on hover or focus. */
export function CommandTrigger({ className }: { className?: string }) {
  const apple = React.useSyncExternalStore(
    subscribeNever,
    isApplePlatform,
    () => true
  );
  const commandTrigger = useCommandTrigger();

  return (
    <button
      type="button"
      aria-label="Search"
      aria-keyshortcuts={apple ? "Meta+K /" : "Control+K /"}
      title={`Search (${apple ? "⌘K" : "Ctrl K"})`}
      {...commandTrigger}
      onPointerEnter={preloadDialog}
      onFocus={preloadDialog}
      className={cn(
        iconButtonVariants(),
        // The key hint only means something with a keyboard: fine pointers only.
        "lg:pointer-fine:w-auto lg:pointer-fine:grid-flow-col lg:pointer-fine:gap-1.5 lg:pointer-fine:pr-1 lg:pointer-fine:pl-2",
        className
      )}
    >
      <Search aria-hidden strokeWidth={1.75} />
      <Kbd aria-hidden className="hidden lg:pointer-fine:inline-flex">
        <ShortcutLabel />
      </Kbd>
    </button>
  );
}
