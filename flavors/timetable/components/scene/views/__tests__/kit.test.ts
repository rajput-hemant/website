// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";

import { spring0, step } from "../kit";

afterEach(() => {
  delete document.documentElement.dataset.motion;
});

describe("view springs", () => {
  it("settle on the target and then report rest, so idle views ask for no frames", () => {
    document.documentElement.dataset.motion = "on";
    const s = spring0();
    let frames = 0;
    while (step(s, 1) && frames < 1000) frames++;
    expect(frames).toBeGreaterThan(5);
    expect(frames).toBeLessThan(1000);
    expect(s.x).toBe(1);
    expect(step(s, 1)).toBe(false);
  });

  it("land at once with motion off", () => {
    const s = spring0();
    expect(step(s, 2)).toBe(false);
    expect(s.x).toBe(2);
  });
});
