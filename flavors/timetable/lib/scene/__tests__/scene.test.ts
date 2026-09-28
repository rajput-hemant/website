import { composeBoard, composeMini } from "@/flavors/timetable/lib/board";
import {
  EXTRAS,
  fitDistance,
  HOUSING,
  MINI_H,
  MODULE_GAP,
  MODULE_ROWS,
  poseFrame,
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
      const { rows } = (pose.mini ? composeMini : composeBoard)(pose.board);
      expect(rows[0].trim().length).toBeGreaterThan(0);
    }
  });
});

describe("pose frames", () => {
  it("keeps each route's object inside what the camera frames", () => {
    for (const pose of Object.values(poses)) {
      const { center, size } = poseFrame(pose);
      const right = center[0] + size[0] / 2;
      expect(center[0] - size[0] / 2).toBeCloseTo(-HOUSING.W / 2);
      if (pose.extra) {
        const extra = EXTRAS[pose.extra];
        expect(extra.x + extra.reach).toBeLessThan(right);
      }
    }
  });

  it("frames a mini board on its short housing, from the top", () => {
    const { center, size } = poseFrame({ ...poses.home, mini: true });
    expect(size[1]).toBe(MINI_H);
    expect(center[1] + size[1] / 2).toBeCloseTo(HOUSING.H / 2);
  });

  it("fits the mini board's one row inside its housing", () => {
    const [top] = MODULE_ROWS;
    const bottom = top.y - top.h / 2;
    expect(bottom).toBeGreaterThan(HOUSING.H / 2 - MINI_H + 0.25);
  });
});
