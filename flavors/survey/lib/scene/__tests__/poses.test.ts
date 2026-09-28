import { buildRelief, SHEET } from "@/flavors/survey/lib/relief";
import {
  decodeBoard,
  encodeBoard,
  fit,
  INSET_ASPECT,
  poseFor,
  type SceneRoute,
} from "@/flavors/survey/lib/scene/poses";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";

const relief = buildRelief(experience, projects, new Date(2026, 8, 20));
const routes: SceneRoute[] = [
  "projects",
  "project",
  "work",
  "about",
  "now",
  "ask",
  "lab",
  "notfound",
];

describe("poseFor", () => {
  it.each(routes)(
    "keeps the %s window on the sheet at the inset's shape",
    (route) => {
      const { window: w } = poseFor(relief, route);
      expect(w.w / w.h).toBeCloseTo(INSET_ASPECT, 5);
      if (w.h <= SHEET.H) {
        expect(w.cy - w.h / 2).toBeGreaterThanOrEqual(-1e-6);
        expect(w.cy + w.h / 2).toBeLessThanOrEqual(SHEET.H + 1e-6);
      }
      if (w.w <= SHEET.W) {
        expect(w.cx - w.w / 2).toBeGreaterThanOrEqual(-1e-6);
        expect(w.cx + w.w / 2).toBeLessThanOrEqual(SHEET.W + 1e-6);
      }
    }
  );

  it("is a fixed point of fit at the inset's shape", () => {
    const { window: w } = poseFor(relief, "work");
    expect(fit(w, INSET_ASPECT)).toEqual(w);
  });

  it("looks at the sea for a missing page", () => {
    const { focus } = poseFor(relief, "notfound");
    expect(focus.x).toBeGreaterThan(relief.coast);
  });
});

describe("the board", () => {
  it("round-trips and names every summit and site", () => {
    const board = decodeBoard(encodeBoard(relief, poseFor(relief, "home")));
    expect(board?.hills).toHaveLength(relief.summits.length);
    expect(Object.keys(board?.points ?? {})).toHaveLength(
      relief.summits.length + relief.sites.length
    );
    expect(decodeBoard("not json")).toBeNull();
  });
});
