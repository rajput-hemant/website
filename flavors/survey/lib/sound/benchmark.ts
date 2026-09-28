import {
  monthAt,
  rolesRunning,
  type Relief,
  type Summit,
} from "@/flavors/survey/lib/relief";

import { createGrainPool } from "@/lib/sound";

import { canPlay, pingDetune, tallyDetune, VOICES } from "./voices";

/**
 * The sheet's own sounds, called from one-line hooks in the map: pinging a
 * benchmark on hover and the tally as the loupe's role count changes. Both
 * keep their own budgets, off the click limiter.
 */

const pings = createGrainPool({ maxPerSecond: 8, minGap: 0.06, maxLive: 6 });
const tallies = createGrainPool({ maxPerSecond: 11, minGap: 0.09, maxLive: 2 });

/** Hover sounds are for a mouse or pen; touch and keyboard focus stay quiet. */
const hovering = (event: { pointerType: string }) =>
  event.pointerType === "mouse" || event.pointerType === "pen";

/** Pointing at a summit rings it at its height (1 octave per 24 months). */
export function pingSummit(
  event: { pointerType: string },
  summit: Pick<Summit, "h" | "current">
): boolean {
  if (!hovering(event) || !canPlay()) return false;
  const voice = summit.current ? VOICES.pingCurrent : VOICES.ping;
  return pings.play(voice, { detune: pingDetune(summit.h) });
}

/** Pointing at a project site rings the fixed site ping. */
export function pingSite(event: { pointerType: string }): boolean {
  if (!hovering(event) || !canPlay()) return false;
  return pings.play(VOICES.pingSite);
}

/** Roles running under the loupe at easting `x`, as the readout counts them. */
export function tallyCount(relief: Relief, x: number): number {
  if (x >= relief.coast) return 0;
  return rolesRunning(relief, Math.floor(monthAt(relief, x))).length;
}

let last: { relief: Relief; n: number } | null = null;

/**
 * Called on every loupe frame; plays only when the count changes, never on
 * the first reading of a sheet. With motion off the loupe snaps, so counts
 * would jump in bursts: the tally stays quiet then, and on coarse pointers.
 */
export function tallyAt(relief: Relief, x: number): boolean {
  const n = tallyCount(relief, x);
  const changed = last?.relief === relief && last.n !== n;
  last = { relief, n };
  if (!changed || !canPlay()) return false;
  if (document.documentElement.dataset.motion !== "on") return false;
  if (!window.matchMedia("(pointer: fine)").matches) return false;
  return tallies.play(VOICES.tally, { detune: tallyDetune(n) });
}
