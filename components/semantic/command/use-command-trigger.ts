"use client";

import * as React from "react";

import { toggleCommandMenu } from "@/lib/command/events";
import {
  getCommandMenuOpen,
  subscribeCommandMenuOpen,
} from "@/lib/command/state";
import { useTriggerToggle } from "@/components/semantic/use-trigger-toggle";

/** Flips the menu only if it is not already as asked: an outside press may have closed it at pointerdown. */
function requestOpen(open: boolean, event: React.MouseEvent) {
  // A real click (not Enter or Space on the button) may animate the open.
  if (open !== getCommandMenuOpen()) {
    toggleCommandMenu({ pointer: event.detail > 0 });
  }
}

/**
 * Props for the button that opens the ⌘K menu so that it also closes it, and
 * reports whether the menu is open.
 */
export function useCommandTrigger(): {
  "aria-haspopup": "dialog";
  "aria-expanded": boolean;
  onPointerDownCapture: () => void;
  onClick: (event: React.MouseEvent) => void;
} {
  const open = React.useSyncExternalStore(
    subscribeCommandMenuOpen,
    getCommandMenuOpen,
    () => false
  );
  return {
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    ...useTriggerToggle(open, requestOpen),
  };
}
