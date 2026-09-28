import { MeshStandardMaterial } from "three";
import { describe, expect, it } from "vitest";

import { createExtras } from "../extras";

describe("route objects beside the indicator", () => {
  it("start hidden, so a route without one (home) shows none", () => {
    const extras = createExtras(new MeshStandardMaterial(), 8);
    expect(extras.root.children.map((g) => g.visible)).toEqual([
      false,
      false,
      false,
      false,
    ]);
    extras.show("beacon");
    expect(extras.root.children.filter((g) => g.visible)).toHaveLength(1);
    extras.show(null);
    expect(extras.root.children.some((g) => g.visible)).toBe(false);
  });
});
