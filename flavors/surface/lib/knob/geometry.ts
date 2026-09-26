/**
 * Where a knob with `count` detents points, in degrees clockwise from twelve
 * o'clock. Up to five detents sit 60 degrees apart (the channel selector);
 * more spread across a 270 degree sweep like a preset encoder.
 */
export function sweepOf(count: number): number {
  if (count <= 1) return 0;
  return count <= 5 ? (count - 1) * 60 : 270;
}

export function detentAngle(count: number, index: number): number {
  if (count <= 1) return 0;
  const sweep = sweepOf(count);
  const i = Math.min(Math.max(index, 0), count - 1);
  return -sweep / 2 + (i * sweep) / (count - 1);
}

export function nearestDetent(count: number, angle: number): number {
  if (count <= 1) return 0;
  const sweep = sweepOf(count);
  const i = Math.round(((angle + sweep / 2) / sweep) * (count - 1));
  return Math.min(Math.max(i, 0), count - 1);
}

/** Pointer angle around a centre, clockwise from twelve o'clock. */
export function pointerAngle(dx: number, dy: number): number {
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

/** A change in angle folded into -180..180, so crossing six o'clock never jumps. */
export function wrapDelta(delta: number): number {
  return ((((delta + 180) % 360) + 360) % 360) - 180;
}

/** How far a drag may run past the end stops before it meets the rubber band. */
export const END_PLAY = 14;

/**
 * The raw dragged angle with soft end stops: past either end the knob follows
 * less and less, like a sprung stop, and never beyond `END_PLAY`.
 */
export function withEndStops(count: number, raw: number): number {
  const half = sweepOf(count) / 2;
  const over = Math.abs(raw) - half;
  if (over <= 0) return raw;
  const give = (over * END_PLAY) / (over + END_PLAY);
  return Math.sign(raw) * (half + give);
}

/** Detents pull the knob towards them as it turns, so it feels notched. */
export function notched(count: number, angle: number, pull = 0.4): number {
  return (
    angle + (detentAngle(count, nearestDetent(count, angle)) - angle) * pull
  );
}
