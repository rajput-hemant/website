import { reach } from "@/flavors/drawing-set/lib/scene/reach";
import { describe, expect, it } from "vitest";

const dist = (p: [number, number], q: [number, number]) =>
  Math.hypot(p[0] - q[0], p[1] - q[1]);

describe("reach", () => {
  it("lands the tip on a reachable target with both links at length", () => {
    const { elbow, tip } = reach(1.2, 0.5, 1, 0.8);
    expect(tip[0]).toBeCloseTo(1.2);
    expect(tip[1]).toBeCloseTo(0.5);
    expect(dist([0, 0], elbow)).toBeCloseTo(1);
    expect(dist(elbow, tip)).toBeCloseTo(0.8);
  });

  it("clamps a target beyond the span onto the straightened arm", () => {
    const { elbow, tip } = reach(5, 0, 1, 0.8);
    expect(tip[0]).toBeCloseTo(1.8, 5);
    expect(tip[1]).toBeCloseTo(0, 5);
    expect(elbow[1]).toBeCloseTo(0, 2);
  });

  it("clamps a target inside the dead zone and keeps link lengths", () => {
    const { elbow, tip } = reach(0.05, 0, 1, 0.8);
    expect(dist([0, 0], tip)).toBeCloseTo(0.2, 5);
    expect(dist([0, 0], elbow)).toBeCloseTo(1);
    expect(dist(elbow, tip)).toBeCloseTo(0.8);
  });

  it("bends the elbow to the requested side", () => {
    expect(reach(1, 1, 1, 1, 1).elbow[1]).toBeGreaterThan(
      reach(1, 1, 1, 1, -1).elbow[1]
    );
  });
});
