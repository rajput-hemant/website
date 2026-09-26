"use client";

import * as React from "react";
import { iconButtonVariants } from "@/flavors/minimal/components/ui/icon-button";
import { Kbd } from "@/flavors/minimal/components/ui/kbd";
import { cn } from "@/flavors/minimal/lib/utils";
import { Search } from "lucide-react";

import { openCommandMenu } from "./command-events";

const preloadDialog = () => void import("./command-dialog");
const subscribeNever = () => () => {};
const isApple = () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/** The header's search button: opens the ⌘K menu, warming its chunk on hover or focus. */
export function CommandTrigger({ className }: { className?: string }) {
  const apple = React.useSyncExternalStore(subscribeNever, isApple, () => true);

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
        // The key hint only means something with a keyboard: fine pointers only.
        "lg:pointer-fine:w-auto lg:pointer-fine:grid-flow-col lg:pointer-fine:gap-1.5 lg:pointer-fine:pr-1 lg:pointer-fine:pl-2",
        className
      )}
    >
      <Search aria-hidden strokeWidth={1.75} />
      <Kbd aria-hidden className="hidden lg:pointer-fine:inline-flex">
        {apple ? "⌘K" : "Ctrl K"}
      </Kbd>
    </button>
  );
}
