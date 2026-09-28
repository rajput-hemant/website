import { createGrainPool } from "@/lib/sound";

import { canPlayScene, VOICES } from "./voices";

/** Grains a single frame may place, and the pool's minimum spacing. */
const PER_FRAME = 3;
const GAP = 0.016;
/** Placement spacing, a hair over GAP so float rounding never rejects one. */
const SPACING = GAP + 0.001;

const jitter = (amount: number) => 1 + (Math.random() * 2 - 1) * amount;

export type Flutter = {
  /** `count` flaps landed this frame; `gain` scales every grain. */
  steps: (count: number, gain?: number) => void;
  /**
   * The drum comes to rest: after the last grain of a turning board, and on
   * its own for a board that changed without turning (reduced motion).
   */
  seat: () => void;
};

/**
 * The flap flutter: one noise grain per flap step, pooled to at most 40 a
 * second and 3 a frame, each with a random ±8% bandpass and ±20% gain so a
 * run of flaps never repeats one waveform.
 */
export function createFlutter(): Flutter {
  const pool = createGrainPool({
    maxPerSecond: 40,
    minGap: GAP,
    maxPerBurst: PER_FRAME,
  });
  // Its own budget, so the seat lands even in the frame of the last grain.
  const seats = createGrainPool({ maxPerSecond: 10, minGap: 0.05 });
  return {
    steps(count, gain = 1) {
      if (count <= 0 || !canPlayScene()) return;
      for (let i = 0; i < Math.min(count, PER_FRAME); i++) {
        pool.play(VOICES.flutter, {
          delay: i * SPACING,
          detune: jitter(0.08),
          gain: gain * jitter(0.2),
        });
      }
    },
    seat() {
      if (canPlayScene()) seats.play(VOICES.seat);
    },
  };
}

/** One pool for the 3D sign and the DOM boards, so they share one budget. */
export const flutter = createFlutter();
