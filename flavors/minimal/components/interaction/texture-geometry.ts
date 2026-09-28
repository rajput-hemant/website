/** The spotlight's radius: its box is twice this, centred on the pointer. */
export const SPOT_RADIUS_PX = 280;

export type Offset = { x: number; y: number };

/**
 * How far the pattern layer is translated for the scroll parallax: it scrolls
 * at `factor` of the page's speed, taken modulo one tile so the layer never
 * moves further than its one-tile overhang. Always in (-tile, 0].
 */
export function parallaxShift(
  scrollY: number,
  tile: number,
  factor: number
): number {
  if (!(tile > 0)) return 0;
  // `|| 0` turns -0 into 0.
  return -((scrollY * factor) % tile) || 0;
}

/** Where the spotlight box goes: centred on the pointer. */
export function spotOffset(pointerX: number, pointerY: number): Offset {
  return { x: pointerX - SPOT_RADIUS_PX, y: pointerY - SPOT_RADIUS_PX };
}

/**
 * The counter-move for the lit pattern inside the spotlight box: it cancels the
 * box's own offset and adds the parallax, so the lit pattern sits exactly on
 * the base pattern wherever the pointer is.
 */
export function spotPatternOffset(
  pointerX: number,
  pointerY: number,
  shift: number
): Offset {
  return {
    x: SPOT_RADIUS_PX - pointerX,
    y: SPOT_RADIUS_PX - pointerY + shift,
  };
}
