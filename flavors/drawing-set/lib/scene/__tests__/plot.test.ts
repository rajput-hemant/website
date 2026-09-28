import { penAt } from "@/flavors/drawing-set/lib/scene/plot";
import { describe, expect, it } from "vitest";

describe("penAt", () => {
  const [w, h] = [4, 1];

  it("starts and ends at the bottom-left corner", () => {
    expect(penAt(0, w, h)).toEqual([-2, -0.5]);
    const [x, y] = penAt(1, w, h);
    expect(x).toBeCloseTo(-2);
    expect(y).toBeCloseTo(-0.5);
  });

  it("walks the edges in plotting order, in proportion to their length", () => {
    // Perimeter 10: bottom edge to 0.4, right edge to 0.5, top edge to 0.9.
    expect(penAt(0.2, w, h)).toEqual([0, -0.5]);
    expect(penAt(0.45, w, h)).toEqual([2, 0]);
    expect(penAt(0.7, w, h)).toEqual([0, 0.5]);
    const [x, y] = penAt(0.95, w, h);
    expect(x).toBeCloseTo(-2);
    expect(y).toBeCloseTo(0);
  });

  it("clamps t outside 0..1", () => {
    expect(penAt(-1, w, h)).toEqual([-2, -0.5]);
    expect(penAt(2, w, h)).toEqual(penAt(1, w, h));
  });
});
