"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { iconButtonVariants } from "@/components/ui/icon-button";
import { Kbd } from "@/components/ui/kbd";

import { openCommandMenu } from "./command-events";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};
const isApple = () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/** The header's search button: opens the ⌘K menu, warming its chunk on hover or focus. */
export function CommandTrigger({ className }: { className?: string }) {
  const apple = useSyncExternalStore(subscribeNever, isApple, () => true);

  return (
    <button
      type="button"
      aria-label="Search"
      aria-keyshortcuts={apple ? "Meta+K /" : "Control+K /"}
      title={`Search (${apple ? "⌘K" : "Ctrl K"})`}
      onClick={openCommandMenu}
      onPointerEnter={preloadDialog}
      onFocus={preloadDialog}
      className={cn(
        iconButtonVariants(),
        "lg:w-auto lg:grid-flow-col lg:gap-1.5 lg:pr-1 lg:pl-2",
        className
      )}
    >
      <Search aria-hidden strokeWidth={1.75} />
      <Kbd aria-hidden className="hidden lg:inline-flex">
        {apple ? "⌘K" : "Ctrl K"}
      </Kbd>
    </button>
  );
}
