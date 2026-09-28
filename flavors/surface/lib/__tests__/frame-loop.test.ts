// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { createFrameLoop } from "../knob/frame-loop";

describe("createFrameLoop", () => {
  it("uses measured dt across frames chained from kick", () => {
    const dts: number[] = [];
    const { kick, tick } = createFrameLoop({
      active: () => true,
      onFrame: (dt) => {
        dts.push(dt);
        return dts.length < 4;
      },
    });

    kick();
    const stepMs = 1000 / 120;
    tick(0);
    tick(stepMs);
    tick(stepMs * 2);
    tick(stepMs * 3);

    expect(dts[0]).toBeCloseTo(1 / 60, 5);
    expect(dts[1]).toBeCloseTo(1 / 120, 5);
    expect(dts[2]).toBeCloseTo(1 / 120, 5);
    expect(dts[3]).toBeCloseTo(1 / 120, 5);
  });
});
