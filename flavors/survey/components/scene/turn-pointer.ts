import type * as React from "react";

/** What a draggable glyph's handle takes from the pointer (`Handle` in the glyph kit). */
export type Turnable = {
  grab(clientX: number): void;
  drag(clientX: number): void;
  release(): void;
  lean(x: number, y: number): void;
};

/**
 * Pointer props for a draggable glyph's box: a primary-button drag turns
 * it (the pointer is captured, so it keeps turning off the box), the mouse
 * leans it, and leaving stands it up. Touch pans the page vertically; a
 * sideways drag turns it.
 */
export function turnPointer(
  glyph: React.RefObject<Turnable | null>
): Pick<
  React.HTMLAttributes<HTMLElement>,
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onPointerLeave"
> {
  return {
    onPointerDown(event) {
      if (event.button !== 0 || !glyph.current) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      glyph.current.grab(event.clientX);
    },
    onPointerMove(event) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        glyph.current?.drag(event.clientX);
        return;
      }
      if (event.pointerType !== "mouse") return;
      const box = event.currentTarget.getBoundingClientRect();
      glyph.current?.lean(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        ((event.clientY - box.top) / box.height) * 2 - 1
      );
    },
    onPointerUp: () => glyph.current?.release(),
    onPointerCancel: () => glyph.current?.release(),
    onPointerLeave: () => glyph.current?.lean(0, 0),
  };
}

/** The poster's and the canvas host's classes: the canvas fades in over the poster while live. */
export const posterClass =
  "absolute inset-0 size-full transition-opacity duration-(--duration-ui) group-data-live:opacity-0";
export const hostClass =
  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-(--duration-ui) group-data-live:opacity-100";
