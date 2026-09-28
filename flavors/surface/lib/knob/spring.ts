/** Knob detent spring tuned to match the old 60 Hz per-frame loop (ω=26 rad/s, ζ=0.55). */
export const KNOB_SPRING_OMEGA = 26;
export const KNOB_SPRING_ZETA = 0.55;
export const MAX_SPRING_DT = 1 / 30;

const SETTLE_POSITION = 0.05;
const SETTLE_VELOCITY = 0.05;

export function springStep(
  x: number,
  v: number,
  goal: number,
  dt: number
): { x: number; v: number; moving: boolean } {
  const clamped = Math.min(dt, MAX_SPRING_DT);
  const omega = KNOB_SPRING_OMEGA;
  const nextV =
    (v + (goal - x) * omega * omega * clamped) *
    Math.exp(-2 * KNOB_SPRING_ZETA * omega * clamped);
  const nextX = x + nextV * clamped;
  const moving =
    Math.abs(goal - nextX) >= SETTLE_POSITION ||
    Math.abs(nextV) >= SETTLE_VELOCITY;
  return {
    x: moving ? nextX : goal,
    v: moving ? nextV : 0,
    moving,
  };
}

/** First-order approach: matches `from + (to-from)*k` per frame when `k = 1 - exp(-rate*dt)`. */
export function expApproach(
  from: number,
  to: number,
  rate: number,
  dt: number,
  snap = false
): number {
  if (snap || Math.abs(to - from) < 0.0005) return to;
  const t = 1 - Math.exp(-rate * Math.min(dt, MAX_SPRING_DT));
  const next = from + (to - from) * t;
  return Math.abs(to - next) > 0.0005 ? next : to;
}
