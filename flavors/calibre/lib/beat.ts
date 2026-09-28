import { BEATS_PER_SECOND } from "./movement";

/**
 * The escapement's arithmetic, kept pure so it can be tested. The rim index
 * moves one step per beat: at rest a seconds hand (1 degree a beat, so one
 * turn a minute, showing the real second), and when a nav item is pointed
 * at, an hour (30 degrees) a beat towards that page's mark.
 */

export const BEAT_MS = 1000 / BEATS_PER_SECOND;
export const DEG_PER_BEAT = 360 / (60 * BEATS_PER_SECOND);
export const DEG_PER_HOUR = 30;

/** The index as a seconds hand at `ms` since the epoch, stepped to the last beat. */
export function secondsAngle(ms: number): number {
  const beats = Math.floor(ms / BEAT_MS);
  return (beats * DEG_PER_BEAT) % 360;
}

/** The mark of an hour on the dial, degrees clockwise from twelve. */
export const hourAngle = (hour: number) => (((hour % 12) + 12) % 12) * 30;

/**
 * One beat from `from` towards `to`: an hour at most, the short way round,
 * landing exactly on the mark. Angles are unwrapped (they may pass 360), so
 * a CSS rotation never spins back the long way.
 */
export function stepTowards(from: number, to: number): number {
  let d = ((((to - from) % 360) + 540) % 360) - 180;
  if (d === -180) d = 180;
  if (Math.abs(d) <= DEG_PER_HOUR) return from + d;
  return from + Math.sign(d) * DEG_PER_HOUR;
}

/** True when `a` and `b` point the same way. */
export const same = (a: number, b: number) =>
  Math.abs(((((a - b) % 360) + 540) % 360) - 180) < 1e-6;

/*
 * A small channel between the nav (which asks for an hour) and the dial and
 * the scene (which beat). Plain DOM events, so no shared store is needed and
 * a page without a dial pays nothing.
 */
const HOUR = "calibre:hour";
const BEAT = "calibre:beat";

/** Points the index at an hour's mark, or back to the seconds with null. */
export function askHour(hour: number | null) {
  window.dispatchEvent(new CustomEvent(HOUR, { detail: hour }));
}

export function onHour(listener: (hour: number | null) => void) {
  const handle = (event: Event) => {
    if (event instanceof CustomEvent) {
      const hour: unknown = event.detail;
      listener(typeof hour === "number" ? hour : null);
    }
  };
  window.addEventListener(HOUR, handle);
  return () => window.removeEventListener(HOUR, handle);
}

/** Announces one beat of the escapement, so the scene can step its train. */
export function tickBeat(count: number) {
  window.dispatchEvent(new CustomEvent(BEAT, { detail: count }));
}

export function onBeat(listener: (count: number) => void) {
  const handle = (event: Event) => {
    if (event instanceof CustomEvent) {
      const count: unknown = event.detail;
      if (typeof count === "number") listener(count);
    }
  };
  window.addEventListener(BEAT, handle);
  return () => window.removeEventListener(BEAT, handle);
}
