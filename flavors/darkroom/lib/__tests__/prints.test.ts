import { archetypeFor, frameArt } from "@/flavors/darkroom/lib/frame-art";
import { poseFor, poses } from "@/flavors/darkroom/lib/scene/poses";
import {
  composePrint,
  encodeBoard,
  MAX_FRAMES,
  parseBoard,
  PRINT_H,
  PRINT_W,
} from "@/flavors/darkroom/lib/scene/prints";
import { describe, expect, it } from "vitest";

const frames = Array.from({ length: 20 }, (_, i) => ({
  archetype: i % 2 ? ("hills" as const) : ("music" as const),
  seed: i,
  select: i === 3,
}));

describe("board", () => {
  it("round-trips frames through the data attribute, capped at one print", () => {
    const board = encodeBoard(frames);
    expect(board.startsWith("music.0 hills.1 music.2 hills.3*")).toBe(true);
    const parsed = parseBoard(board);
    expect(parsed).toHaveLength(MAX_FRAMES);
    expect(parsed[3]).toEqual({ archetype: "hills", seed: 3, select: true });
  });

  it("skips tokens it doesn't know", () => {
    expect(parseBoard("canvas.1 music.9x sun.2")).toEqual([
      { archetype: "sun", seed: 2, select: false },
    ]);
    expect(parseBoard(null)).toEqual([]);
  });
});

describe("prints", () => {
  it("keeps every shape of every print on the paper", () => {
    for (const pose of Object.values(poses)) {
      for (const shape of composePrint(pose.print, frames)) {
        if (shape.kind !== "rect") continue;
        expect(shape.x).toBeGreaterThanOrEqual(0);
        expect(shape.y).toBeGreaterThanOrEqual(0);
        expect(shape.x + shape.w).toBeLessThanOrEqual(PRINT_W + 0.001);
        expect(shape.y + shape.h).toBeLessThanOrEqual(PRINT_H + 0.001);
      }
    }
  });

  it("rings the selects on a contact print", () => {
    const rings = composePrint("sheet", frames.slice(0, 5)).filter(
      (shape) => shape.kind === "ring"
    );
    expect(rings).toHaveLength(1);
  });

  it("falls back to the home pose for another edition's route", () => {
    expect(poseFor("press-sheet")).toBe(poses.home);
    expect(poseFor("lab").print).toBe("test");
  });
});

describe("frame art", () => {
  it("reads the picture from the project's own words", () => {
    const base = { slug: "s", name: "", stack: [] };
    expect(archetypeFor({ ...base, tagline: "A terminal AI chat app" })).toBe(
      "terminal"
    );
    expect(
      archetypeFor({ ...base, tagline: "An unofficial API wrapper" })
    ).toBe("api");
    expect(frameArt("music").length).toBeGreaterThan(3);
  });
});
