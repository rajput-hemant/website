import { stackLabels } from "@/flavors/maquette/lib/scene/labels";
import { describe, expect, it } from "vitest";

describe("stackLabels", () => {
  it("leaves labels that do not touch where they are", () => {
    expect(
      stackLabels([
        { x: 0, y: 0, w: 50, h: 20 },
        { x: 100, y: 0, w: 50, h: 20 },
      ])
    ).toEqual([0, 0]);
  });

  it("lifts the higher of two overlapping labels above the lower", () => {
    expect(
      stackLabels([
        { x: 0, y: 100, w: 80, h: 20 },
        { x: 40, y: 90, w: 80, h: 20 },
      ])
    ).toEqual([0, 12]);
  });

  it("keeps climbing past every label it would cover", () => {
    // The one at 95 climbs to 78, so the one at 78 climbs on to 56.
    expect(
      stackLabels([
        { x: 0, y: 100, w: 80, h: 20 },
        { x: 0, y: 78, w: 80, h: 20 },
        { x: 0, y: 95, w: 80, h: 20 },
      ])
    ).toEqual([0, 22, 17]);
  });
});
