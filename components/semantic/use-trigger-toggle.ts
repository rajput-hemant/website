"use client";

import * as React from "react";

/**
 * Click handlers that make a popup's own trigger button toggle it. When the
 * popup is anchored to a button rather than opened by a Base UI trigger, an
 * outside press on that button closes the popup on pointerdown and the click
 * that follows would reopen it. The state seen at pointerdown decides: the
 * click asks for the opposite, so the button toggles exactly once. Keyboard
 * clicks have no pointerdown and toggle the current state.
 */
export function useTriggerToggle(
  open: boolean,
  setOpen: (open: boolean, event: React.MouseEvent) => void
): {
  onPointerDownCapture: () => void;
  onClick: (event: React.MouseEvent) => void;
} {
  const openAtPress = React.useRef<boolean | null>(null);
  return {
    onPointerDownCapture: () => {
      openAtPress.current = open;
    },
    onClick: (event) => {
      setOpen(!(openAtPress.current ?? open), event);
      openAtPress.current = null;
    },
  };
}
