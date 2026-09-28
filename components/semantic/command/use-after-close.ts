"use client";

import * as React from "react";

/**
 * Work that has to wait until a controlled Base UI dialog has left: its exit
 * motion done, the popup unmounted, focus and the scroll lock released.
 * `close(then)` asks the owner to close; `then` runs on the frame after Base
 * UI reports the close complete. `closeLater(ms)` closes after a pause (a
 * "Copied" tick). Pass `onDialogOpenChange` and `onOpenChangeComplete` to
 * the Dialog's root.
 *
 * Reopening, or a dismissal of Base UI's own (Escape, a click outside),
 * drops whatever was queued: a pick followed by a reopen during the exit, or
 * an Escape before the reopen finished, must not replay the old navigation,
 * and a pending delayed close must not shut the new session.
 *
 * Draining in `onOpenChange` instead never works for a close the menu starts
 * itself: Base UI calls `onOpenChange` only for its own dismissals (Esc, a
 * click outside), not when the owner flips `open`. And a navigation started
 * while the dialog is still on screen snapshots it into the page's view
 * transition, where the incoming page paints over it.
 */
export function useAfterClose(
  open: boolean,
  onOpenChange: (open: boolean) => void
): {
  close: (then?: () => void) => void;
  closeLater: (delayMs: number) => void;
  onDialogOpenChange: (open: boolean) => void;
  onOpenChangeComplete: (open: boolean) => void;
} {
  const pending = React.useRef<(() => void) | null>(null);
  const timer = React.useRef<number | undefined>(undefined);
  const frame = React.useRef<number | undefined>(undefined);

  const cancelTimer = React.useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  }, []);
  const drop = React.useCallback(() => {
    pending.current = null;
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    cancelTimer();
  }, [cancelTimer]);

  // The owner reopened (⌘K, `/`); Base UI's own opens come through below.
  React.useEffect(() => {
    if (open) drop();
  }, [open, drop]);
  React.useEffect(() => drop, [drop]);

  const onDialogOpenChange = React.useCallback(
    (next: boolean) => {
      drop();
      onOpenChange(next);
    },
    [drop, onOpenChange]
  );

  const close = React.useCallback(
    (then?: () => void) => {
      cancelTimer();
      pending.current = then ?? null;
      onOpenChange(false);
    },
    [onOpenChange, cancelTimer]
  );

  const closeLater = React.useCallback(
    (delayMs: number) => {
      cancelTimer();
      timer.current = window.setTimeout(() => {
        timer.current = undefined;
        close();
      }, delayMs);
    },
    [close, cancelTimer]
  );

  const onOpenChangeComplete = React.useCallback((next: boolean) => {
    const then = pending.current;
    pending.current = null;
    if (next || !then) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = undefined;
      then();
    });
  }, []);

  return { close, closeLater, onDialogOpenChange, onOpenChangeComplete };
}
