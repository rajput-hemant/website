import { createGrainPool } from "@/lib/sound";

import { canPlay, VOICES } from "./voices";

/** Detents play at most one per 25ms, however fast the spin. */
const DETENT_GAP = 0.025;
/** The bandpass detune across the sweep, so a spin reads as a ratchet. */
const DETENT_SPREAD = 0.03;

/** Pitch ratio for detent `index` of `count`: 0.97 at the first, 1.03 at the last. */
export function detentDetune(index: number, count: number): number {
  if (count <= 1) return 1;
  const t = Math.min(1, Math.max(0, index / (count - 1)));
  return 1 - DETENT_SPREAD + 2 * DETENT_SPREAD * t;
}

/**
 * An end-stop latch: true on the first move that meets a stop, then false
 * until the knob has left it (so pressing against it clunks once).
 */
export function createStopLatch(): (contact: boolean) => boolean {
  let touching = false;
  return (contact) => {
    const hit = contact && !touching;
    touching = contact;
    return hit;
  };
}

export type Detents = {
  /** The knob crossed into detent `index` of `count`. */
  detent: (index: number, count: number) => void;
  /** The knob met an end stop. */
  endStop: () => void;
};

/**
 * Knob sounds, on grain pools rather than the click limiter: a fast spin
 * crosses a detent every frame or two, and the limiter's 40ms and 80ms
 * gates would drop most of them. The end stop has its own budget so it
 * lands in the same frame as the last detent.
 */
export function createDetents(): Detents {
  const detents = createGrainPool({
    maxPerSecond: 40,
    minGap: DETENT_GAP,
    maxLive: VOICES.detent.layers.length * 4,
  });
  const stops = createGrainPool({
    maxPerSecond: 4,
    minGap: 0.1,
    maxLive: VOICES.endStop.layers.length,
  });
  return {
    detent(index, count) {
      if (!canPlay()) return;
      detents.play(VOICES.detent, { detune: detentDetune(index, count) });
    },
    endStop() {
      if (canPlay()) stops.play(VOICES.endStop);
    },
  };
}

/** One set for the page: only one knob owns the store at a time. */
export const knobSounds = createDetents();
