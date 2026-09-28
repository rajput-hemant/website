import { patchFor } from "@/flavors/mission/lib/patch";
import { describe, expect, it } from "vitest";

describe("patchFor", () => {
  it("draws one orbit per technology, at most five", () => {
    expect(
      patchFor({ technologies: 3, state: "nominal", year: 2022, index: 0 })
        .orbits
    ).toHaveLength(3);
    expect(
      patchFor({ technologies: 9, state: "nominal", year: 2022, index: 0 })
        .orbits
    ).toHaveLength(5);
    expect(
      patchFor({ technologies: 0, state: "nominal", year: 2022, index: 0 })
        .orbits
    ).toHaveLength(1);
  });

  it("dashes the outer orbit of a mission in flight", () => {
    const patch = patchFor({
      technologies: 3,
      state: "inflight",
      year: 2023,
      index: 1,
    });
    expect(patch.orbits.map((o) => o.kind)).toEqual(["solid", "solid", "dash"]);
    expect(patch.craft).not.toBeNull();
  });

  it("decays a deorbited mission in a spiral to the planet", () => {
    const patch = patchFor({
      technologies: 3,
      state: "deorbited",
      year: 2023,
      index: 2,
    });
    expect(patch.craft).toBeNull();
    expect(patch.orbits.every((o) => o.kind === "faint" && !o.front)).toBe(
      true
    );
    const end = patch.decay?.end;
    expect(end && Math.hypot(end.x - 60, (end.y - 60) / 0.34)).toBeCloseTo(
      8.5,
      0
    );
  });
});
