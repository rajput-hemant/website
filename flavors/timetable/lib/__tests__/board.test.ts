import {
  composeBoard,
  departures,
  DRUM,
  fitBoard,
  flapSteps,
  toDrum,
} from "@/flavors/timetable/lib/board";
import { describe, expect, it } from "vitest";

describe("toDrum", () => {
  it("keeps only what the drum can print", () => {
    expect(toDrum("  Lipi  (beta) é! ")).toBe("LIPI  BETA  E");
    expect(toDrum("shadcn/ui")).toBe("SHADCN/UI");
  });
});

describe("fitBoard", () => {
  it("pads short text to the cell count", () => {
    expect(fitBoard("Now", 5)).toBe("NOW  ");
  });

  it("keeps whole words, then cuts hard when one word is too long", () => {
    expect(fitBoard("Fullstack engineer", 13)).toBe("FULLSTACK    ");
    expect(fitBoard("Infinitunes", 8)).toBe("INFINITU");
  });

  it("never exceeds the cell count", () => {
    for (const text of ["a b c d e f g", "JioSaavn API wrapper", ""]) {
      expect(fitBoard(text, 10)).toHaveLength(10);
    }
  });
});

describe("flapSteps", () => {
  it("turns forwards through the drum and wraps", () => {
    expect(flapSteps(" ", "A")).toBe(1);
    expect(flapSteps("B", "A")).toBe(DRUM.length - 1);
    expect(flapSteps("Z", "Z")).toBe(0);
  });
});

describe("departures", () => {
  it("maps every project status", () => {
    expect(Object.keys(departures).sort()).toEqual([
      "active",
      "archived",
      "maintained",
      "wip",
    ]);
  });
});

describe("composeBoard", () => {
  it("right-aligns the tag in yellow on the bottom row", () => {
    expect(composeBoard("Zunta|Since Jan 26|Now", [12, 16])).toEqual({
      rows: ["ZUNTA       ", "SINCE JAN 26 NOW"],
      yellowFrom: 13,
    });
  });

  it("keeps the destination whole and the detail clear of the tag", () => {
    const { rows, yellowFrom } = composeBoard(
      "JioSaavn API|Bun 2023|Cancelled",
      [12, 16]
    );
    expect(rows).toEqual(["JIOSAAVN API", "BUN    CANCELLED"]);
    expect(yellowFrom).toBe(7);
  });

  it("fills a plain label without any yellow", () => {
    expect(composeBoard("Projects|Departures", [12, 16])).toEqual({
      rows: ["PROJECTS    ", "DEPARTURES      "],
      yellowFrom: 16,
    });
  });
});
