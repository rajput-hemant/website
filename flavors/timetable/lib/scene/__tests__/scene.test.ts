import { composeBoard } from "@/flavors/timetable/lib/board";
import {
  fitDistance,
  HOUSING,
  MODULE_GAP,
  MODULE_ROWS,
  poses,
} from "@/flavors/timetable/lib/scene/poses";
import { describe, expect, it } from "vitest";

describe("fitDistance", () => {
  const fov = 26;
  const t = Math.tan((fov * Math.PI) / 360);
  it.each([0.6, 1, 1.6, 2.4])("keeps the frame in view at aspect %f", (a) => {
    const d = fitDistance([4, 2], fov, a);
    const h = 2 * d * t;
    expect(h).toBeGreaterThanOrEqual(2 - 1e-9);
    expect(h * a).toBeGreaterThanOrEqual(4 - 1e-9);
  });
});

describe("the housing", () => {
  it("fits every module row inside its face", () => {
    for (const row of MODULE_ROWS) {
      const width = row.n * row.w + (row.n - 1) * MODULE_GAP;
      expect(width).toBeLessThan(HOUSING.W - 0.2);
    }
  });

  it("has a readable board for every route", () => {
    for (const pose of Object.values(poses)) {
      const { rows } = composeBoard(pose.board);
      expect(rows[0].trim().length).toBeGreaterThan(0);
    }
  });
});
