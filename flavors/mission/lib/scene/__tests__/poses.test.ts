import { flightPlan } from "@/flavors/mission/lib/flight";
import { drawGlobe } from "@/flavors/mission/lib/scene/drawing";
import {
  asSceneRoute,
  boardFor,
  decodeBoard,
  encodeBoard,
  litAt,
  poses,
} from "@/flavors/mission/lib/scene/poses";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";

/** The item at `i`, or a failed test. */
function at<T>(list: readonly T[], i: number): T {
  const item = list[i];
  if (item === undefined) throw new Error(`nothing at ${i}`);
  return item;
}

const flight = flightPlan(experience, projects, new Date(2026, 8, 27));
const board = boardFor(flight);

describe("poses", () => {
  it("narrows any route to one of ours", () => {
    expect(asSceneRoute("work")).toBe("work");
    expect(asSceneRoute("drawer-3")).toBe("home");
    expect(asSceneRoute("toString")).toBe("home");
  });

  it("lights the orbits in phase, all of them, or none", () => {
    const zunta = at(board.orbits, 5);
    const fastlane = at(board.orbits, 0);
    expect(litAt(poses.home, zunta, board.now)).toBe(true);
    expect(litAt(poses.home, fastlane, board.now)).toBe(false);
    expect(litAt(poses.resume, fastlane, board.now)).toBe(true);
    expect(litAt(poses.notfound, zunta, board.now)).toBe(false);
  });
});

describe("board", () => {
  it("round-trips through data-scene-board", () => {
    const decoded = decodeBoard(encodeBoard(board));
    expect(decoded?.orbits).toEqual(board.orbits);
    expect(decoded?.now).toBeCloseTo(board.now, 2);
  });

  it("rejects anything malformed", () => {
    expect(decodeBoard(null)).toBeNull();
    expect(decodeBoard("x|1,2,3,4")).toBeNull();
    expect(decodeBoard("3|a,,b,c")).toBeNull();
  });
});

describe("drawGlobe", () => {
  it("faces the launch site on home and hides it on the 404", () => {
    const home = drawGlobe(board, poses.home);
    expect(home.site).not.toBeNull();
    expect(Math.abs(home.site?.[0] ?? 9)).toBeLessThan(0.05);
    expect(drawGlobe(board, poses.notfound).site).toBeNull();
  });

  it("draws every orbit and puts a craft only on the lit ones", () => {
    const home = drawGlobe(board, poses.home);
    expect(home.orbits).toHaveLength(6);
    expect(home.orbits.every((o) => o.d.startsWith("M"))).toBe(true);
    expect(home.orbits.filter((o) => o.lit)).toHaveLength(1);
    expect(home.orbits.filter((o) => !o.lit).every((o) => !o.craft)).toBe(true);
  });
});
