import { input } from "@/lib/scene/store";

/**
 * The surveyor's loupe: one lens per page, in sheet units. The DOM side (the
 * map overlay, the scene slot) and the relief mesh both read this object, so
 * the ring, its readout and the magnified terrain move as one. It eases 0.2
 * of the way per frame and snaps with motion off; the frame loop only runs
 * while it moves.
 */
export const loupe = { x: 0, p: 0, tx: 0, tp: 0, rest: { x: 0, p: 0 } };

type Listener = (x: number, p: number) => void;
const listeners = new Set<Listener>();
let frame = 0;

const still = () => document.documentElement.dataset.motion !== "on";

function step() {
  const k = still() ? 1 : 0.2;
  loupe.x += (loupe.tx - loupe.x) * k;
  loupe.p += (loupe.tp - loupe.p) * k;
  const done =
    Math.abs(loupe.tx - loupe.x) + Math.abs(loupe.tp - loupe.p) < 0.3;
  if (done) {
    loupe.x = loupe.tx;
    loupe.p = loupe.tp;
  }
  // Keeps the shared scene clock awake while the lens travels.
  input.movedAt = performance.now();
  for (const listener of listeners) listener(loupe.x, loupe.p);
  frame = done ? 0 : requestAnimationFrame(step);
}

/** Sends the lens to a point on the sheet. */
export function aimLoupe(x: number, p: number) {
  loupe.tx = x;
  loupe.tp = p;
  frame ||= requestAnimationFrame(step);
}

/** Sends the lens back to where this page rests it. */
export const restLoupe = () => aimLoupe(loupe.rest.x, loupe.rest.p);

/** Puts the lens at a page's resting point at once, e.g. on navigation. */
export function placeLoupe(x: number, p: number) {
  loupe.rest = { x, p };
  loupe.x = loupe.tx = x;
  loupe.p = loupe.tp = p;
  for (const listener of listeners) listener(x, p);
}

export function onLoupe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
