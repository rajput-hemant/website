/**
 * Damped poses for the glyphs, advanced by the shared scene clock. No
 * three.js, so the rules are testable on their own.
 */

/** Hover lifts and tilts. */
export const HOVER_LAMBDA = 12;
/** Disclosures opening and closing. */
export const TOGGLE_LAMBDA = 8;

/** Below this a value counts as settled and snaps to its target. */
const REST = 1e-3;

/**
 * With motion off the springs don't vanish: they settle three times faster,
 * so a state change still reads as a change, just a quieter one.
 */
export const REDUCED_MOTION_SPEEDUP = 3;

/** One damped value per key, plus whether any of them moved this frame. */
export type Pose<K extends string> = Record<K, number>;

/**
 * Frame-rate independent exponential approach (`THREE.MathUtils.damp`).
 * Returns the new value; within {@link REST} of the target it is the target.
 */
export function damp(
  value: number,
  target: number,
  lambda: number,
  dt: number
): number {
  const next = value + (target - value) * (1 - Math.exp(-lambda * dt));
  return Math.abs(target - next) < REST ? target : next;
}

/**
 * Moves every key of `pose` toward `target` and reports whether any is still
 * travelling, which is what keeps the clock awake.
 */
export function step<K extends string>(
  pose: Pose<K>,
  target: Readonly<Pose<K>>,
  lambda: number,
  dt: number,
  motion: boolean
): boolean {
  const rate = motion ? lambda : lambda * REDUCED_MOTION_SPEEDUP;
  let moving = false;
  for (const key of Object.keys(target) as K[]) {
    const next = damp(pose[key], target[key], rate, dt);
    pose[key] = next;
    if (next !== target[key]) moving = true;
  }
  return moving;
}

/**
 * A damped spring for one-shot wobbles (a plucked thread, a shaken lock):
 * position and velocity toward 0. Returns whether it still moves.
 */
export function spring(
  state: { x: number; v: number },
  stiffness: number,
  damping: number,
  dt: number
): boolean {
  // Sub-steps keep it stable when a slow frame hands over a long dt.
  const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    state.v += (-stiffness * state.x - damping * state.v) * h;
    state.x += state.v * h;
  }
  if (Math.abs(state.x) < REST && Math.abs(state.v) < REST) {
    state.x = 0;
    state.v = 0;
    return false;
  }
  return true;
}
