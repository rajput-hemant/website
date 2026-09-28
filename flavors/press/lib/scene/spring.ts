/** The released corner's spring: stiffness, damping and mass (underdamped). */
const SPRING_K = 320;
const SPRING_C = 26;
const SPRING_M = 1;
/** Spring substep, seconds, so a long frame never destabilises it. */
const SPRING_STEP = 1 / 240;

/**
 * Steps `value` toward `target` on a spring carrying `velocity` (per second);
 * returns the new pair, or null once it has settled at the target.
 */
export function springStep(
  value: number,
  velocity: number,
  target: number,
  delta: number
): [number, number] | null {
  let x = value;
  let v = velocity;
  for (let t = 0; t < delta; t += SPRING_STEP) {
    const h = Math.min(SPRING_STEP, delta - t);
    v += ((SPRING_K * (target - x) - SPRING_C * v) / SPRING_M) * h;
    x += v * h;
  }
  if (Math.abs(v) < 1e-3 && Math.abs(target - x) < 5e-4) return null;
  return [x, v];
}
