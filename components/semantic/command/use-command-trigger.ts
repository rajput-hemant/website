"use client";

import * as React from "react";

import { toggleCommandMenu } from "@/lib/command/events";
import {
  getCommandMenuOpen,
  subscribeCommandMenuOpen,
} from "@/lib/command/state";

/**
 * Props for the button that opens the ⌘K menu so that it also closes it.
 * The menu is modal, and an outside press closes it on pointerdown, so the
 * click that follows would reopen it if the button simply toggled. The state
 * seen at pointerdown decides what the click should leave behind, and the
 * click only acts when the menu is not already there.
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
  const openAtPress = React.useRef<boolean | null>(null);
  return {
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    onPointerDownCapture: () => {
      openAtPress.current = getCommandMenuOpen();
    },
    onClick: (event) => {
      const wantOpen = !(openAtPress.current ?? getCommandMenuOpen());
      openAtPress.current = null;
      // A real click (not Enter or Space on the button) may animate the open.
      if (wantOpen !== getCommandMenuOpen()) {
        toggleCommandMenu({ pointer: event.detail > 0 });
      }
    },
  };
}
