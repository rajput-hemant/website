import type { Pose } from "@/flavors/drawing-set/lib/scene/poses";

import { motionOn } from "@/lib/motion/entrance";
import { createGrainPool, playVoice } from "@/lib/sound";

import { canPlayScene, VOICES } from "./voices";

/** Plotter steps a second (the 55Hz AM gate), and steps per re-plot (~290ms). */
const STEP_HZ = 55;
export const PLOT_STEPS = 16;
/** At most one re-plot, or one reduced-motion thunk, per this many ms. */
export const PLOT_INTERVAL = 800;

/**
 * Lets a play through at most once per `intervalMs` (by `now`, in ms). A
 * play the engine refuses does not use up the window.
 */
export function createRateGate(intervalMs: number) {
  let playedAt = -Infinity;
  return (now: number, play: () => boolean): boolean => {
    if (now - playedAt < intervalMs) return false;
    if (!play()) return false;
    playedAt = now;
    return true;
  };
}

/** True when moving from `from` to `to` slides a drawer further out. */
export function drawerOpens(
  from: Pick<Pose, "drawer" | "open">,
  to: Pick<Pose, "drawer" | "open">
): boolean {
  if (to.drawer === null || to.open <= 0) return false;
  return to.drawer !== from.drawer || to.open > from.open;
}

// Scene voices skip the click limiter, so the link that navigated never
// starves the drawer it opens.
const scene = createGrainPool({ maxPerSecond: 4, minGap: 0.05, maxLive: 4 });
const stepper = createGrainPool({
  maxPerSecond: STEP_HZ + 5,
  minGap: 1 / STEP_HZ - 0.002,
  maxLive: PLOT_STEPS,
});
const plotGate = createRateGate(PLOT_INTERVAL);
// Shared by the drawer and the plot, so one navigation under reduced motion
// makes one thunk however many things would have moved.
const thunkGate = createRateGate(PLOT_INTERVAL);

function thunk(): boolean {
  return thunkGate(performance.now(), () => scene.play(VOICES.thunk));
}

/** The route changed: the plan-chest runner if the new pose opens a drawer. */
export function playRouteDrawer(
  from: Pick<Pose, "drawer" | "open">,
  to: Pick<Pose, "drawer" | "open">
): void {
  if (!drawerOpens(from, to) || !canPlayScene()) return;
  if (motionOn()) scene.play(VOICES.drawer);
  else thunk();
}

/** A scene sheet, card or study was clicked to open. Silent on touch. */
export function playSheet(event: MouseEvent): void {
  if (event instanceof PointerEvent && event.pointerType === "touch") return;
  if (canPlayScene()) playVoice(VOICES.sheet);
}

/** A dimension re-plots after navigation: the stepper, rate-limited. */
export function playPlot(): void {
  if (!canPlayScene()) return;
  if (!motionOn()) {
    thunk();
    return;
  }
  plotGate(performance.now(), () => {
    let placed = 0;
    for (let i = 0; i < PLOT_STEPS; i++) {
      if (stepper.play(VOICES.plot, { delay: i / STEP_HZ })) placed++;
    }
    return placed > 0;
  });
}
