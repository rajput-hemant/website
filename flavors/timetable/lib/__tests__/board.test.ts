import {
  ASK_SENT_BOARD,
  composeBoard,
  composeMini,
  departures,
  DRUM,
  drumOf,
  fitBoard,
  flapSteps,
  glyphOf,
  riffleFrom,
  stepToward,
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
      yellowRow: 1,
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
      yellowRow: 1,
    });
  });

  it("fits the ask-sent notice on the indicator drum", () => {
    const { rows } = composeBoard(ASK_SENT_BOARD);
    expect(rows[0].trim()).toBe("NOTICE RCVD");
    expect(rows[1]).toMatch(/AWAITING.*HELD/);
  });
});

describe("composeMini", () => {
  it("sets the text and a yellow tag on the one top row", () => {
    expect(composeMini("Page 2|of 5")).toEqual({
      rows: ["PAGE 2  OF 5", " ".repeat(16)],
      yellowFrom: 8,
      yellowRow: 0,
    });
  });

  it("leaves a plain label white", () => {
    const { rows, yellowFrom } = composeMini("Notice 014");
    expect(rows[0]).toBe("NOTICE 014  ");
    expect(yellowFrom).toBe(12);
  });
});

describe("stepToward", () => {
  /** Every glyph a module shows on its way from `from` to `to`. */
  const walk = (from: number, to: number) => {
    const seen = [from];
    for (let cur = from; cur !== to && seen.length <= DRUM.length * 2;) {
      cur = stepToward(cur, to);
      seen.push(cur);
    }
    return seen;
  };

  it("turns one flap at a time, in drum order, and lands", () => {
    const path = walk(glyphOf("X"), glyphOf("C"));
    expect(path.at(-1)).toBe(glyphOf("C"));
    expect(path.length - 1).toBe(flapSteps("X", "C"));
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1] ?? 0;
      expect(drumOf(path[i] ?? 0)).toBe((drumOf(prev) + 1) % DRUM.length);
    }
  });

  it("switches to the target's ink as it turns", () => {
    const path = walk(glyphOf("A"), glyphOf("D", true));
    expect(path.slice(1).every((g) => g >= DRUM.length)).toBe(true);
    expect(path.at(-1)).toBe(glyphOf("D", true));
  });

  it("stays put on the target", () => {
    expect(stepToward(glyphOf("K"), glyphOf("K"))).toBe(glyphOf("K"));
  });
});

describe("riffleFrom", () => {
  it("starts at most `max` flaps up the drum, never before blank", () => {
    expect(riffleFrom(glyphOf("A"), 8)).toBe(glyphOf(" "));
    expect(riffleFrom(glyphOf("Z"), 8)).toBe(glyphOf("R"));
    expect(flapSteps(DRUM[riffleFrom(glyphOf("7"), 3)] ?? " ", "7")).toBe(3);
  });

  it("keeps the target's ink", () => {
    expect(riffleFrom(glyphOf("Z", true), 8)).toBe(glyphOf("R", true));
  });
});
