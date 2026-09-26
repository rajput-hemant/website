"use client";

import * as React from "react";

import { pointer } from "@/lib/motion/pointer";

export type PointerListeners = {
  /** Every fine-pointer move, in client px (a custom cursor follows it). */
  onMove?: (x: number, y: number) => void;
  /** The element under the pointer changed. */
  onHover?: (target: Element | null) => void;
  /** The pointer left the window, or a touch took over. */
  onLeave?: () => void;
};

/**
 * One passive listener set that feeds the shared `pointer` and tells an
 * edition's cursor where a mouse or pen is and what it is over. Touch never
 * moves it and hides it instead. No animation library: the edition draws.
 */
export function usePointerTracking(listeners: PointerListeners = {}) {
  const ref = React.useRef(listeners);
  React.useEffect(() => {
    ref.current = listeners;
  });

  React.useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.nx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = -((event.clientY / window.innerHeight) * 2 - 1);
      pointer.fine = true;
      pointer.movedAt = performance.now();
      ref.current.onMove?.(event.clientX, event.clientY);
    };
    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      ref.current.onHover?.(event.target as Element | null);
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") ref.current.onLeave?.();
    };
    const onLeave = () => ref.current.onLeave?.();

    const root = document.documentElement;
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);
}
