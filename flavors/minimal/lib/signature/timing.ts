import type { SignatureStroke } from "@/flavors/minimal/components/signature/types";

export type StrokeTiming = {
  /** Milliseconds from the start of the play until this stroke begins. */
  delay: number;
  /** Milliseconds this stroke takes to draw. */
  duration: number;
};

/**
 * Lays the pen's strokes out on one timeline, squeezed or stretched so the
 * whole signature, lifts included, takes `total` ms after `start` ms. The
 * strokes keep their relative pace, so the hand still reads as a hand.
 */
export function strokeTimeline(
  strokes: readonly Pick<SignatureStroke, "duration" | "pause">[],
  { start = 0, total }: { start?: number; total: number }
): StrokeTiming[] {
  const natural = strokes.reduce(
    (sum, stroke) => sum + stroke.pause + stroke.duration,
    0
  );
  const scale = natural > 0 ? total / natural : 0;

  let cursor = start;
  return strokes.map((stroke) => {
    cursor += stroke.pause * scale;
    const timing = {
      delay: Math.round(cursor),
      duration: Math.round(stroke.duration * scale),
    };
    cursor += stroke.duration * scale;
    return timing;
  });
}
