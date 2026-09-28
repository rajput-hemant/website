import { describe, expect, it } from "vitest";

import { strokeTimeline } from "../timing";

const strokes = [
  { duration: 600, pause: 0 },
  { duration: 300, pause: 100 },
];

describe("strokeTimeline", () => {
  it("fits the whole signature, lifts included, into the total", () => {
    const timeline = strokeTimeline(strokes, { total: 500 });
    expect(timeline).toEqual([
      { delay: 0, duration: 300 },
      { delay: 350, duration: 150 },
    ]);
    const last = timeline.at(-1)!;
    expect(last.delay + last.duration).toBe(500);
  });

  it("offsets every stroke by the start", () => {
    const timeline = strokeTimeline(strokes, { start: 140, total: 1000 });
    expect(timeline[0]).toEqual({ delay: 140, duration: 600 });
    expect(timeline[1]).toEqual({ delay: 840, duration: 300 });
  });

  it("returns an empty timeline for no strokes", () => {
    expect(strokeTimeline([], { total: 800 })).toEqual([]);
  });
});
