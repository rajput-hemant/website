import { describe, expect, it } from "vitest";

import { springStep } from "../knob/spring";

function simulate(goal: number, hz: number, seconds = 1.2) {
  let x = 0;
  let v = 0;
  const dt = 1 / hz;
  const steps = Math.floor(seconds * hz);
  for (let i = 0; i < steps; i++) {
    const next = springStep(x, v, goal, dt);
    x = next.x;
    v = next.v;
    if (!next.moving) break;
  }
  return x;
}

describe("knob spring", () => {
  it("settles near the goal at 60 and 120 Hz within the same tolerance", () => {
    const goal = 42;
    const at60 = simulate(goal, 60);
    const at120 = simulate(goal, 120);
    expect(at60).toBeCloseTo(goal, 1);
    expect(at120).toBeCloseTo(goal, 1);
    expect(Math.abs(at60 - at120)).toBeLessThan(0.35);
  });
});
