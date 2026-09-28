import {
  poses,
  printFor,
  samePrint,
  type PrintItem,
} from "@/flavors/press/lib/scene/poses";
import { describe, expect, it } from "vitest";

const items: PrintItem[] = [
  { id: "project:atlas", label: "Atlas", weight: 1 },
  { id: "run:acme", label: "Acme Industries", weight: 3 },
  { id: "run:long", label: "Long", weight: 9 },
  { id: "skills:front", label: "Interface", weight: 4 },
  { id: "query:q1", label: "Query 014", weight: 1 },
];

describe("printFor", () => {
  it("prints the page's own sheet with nothing or the headline hovered", () => {
    const own = printFor(poses.home, null, items);
    expect(own.glyph).toBe("HR");
    expect(own.slug).toBe(poses.home.slug);
    expect(samePrint(printFor(poses.home, "register", items), own)).toBe(true);
  });

  it("prints what the hovered item is", () => {
    expect(printFor(poses.projects, "project:atlas", items)).toMatchObject({
      glyph: "A",
      slug: "SIGNATURE  /  ATLAS",
    });
    const run = printFor(poses.work, "run:acme", items);
    expect(run.glyph).toBe("03");
    expect(run.slug).toBe("RUN 03  /  ACME INDUSTRIES");
    expect(run.bars).toEqual([1, 1, 1, 0, 0, 0]);
    expect(printFor(poses.work, "run:long", items).bars).toEqual([
      1, 1, 1, 1, 1, 1,
    ]);
    expect(printFor(poses.about, "skills:front", items)).toMatchObject({
      glyph: "I",
      bars: [1, 1, 1, 1, 0, 0],
    });
    expect(printFor(poses.now, "now:1", items).glyph).toBe("02");
    expect(printFor(poses.ask, "query:q1", items).glyph).toBe("014");
  });

  it("falls back to the item id when the page gave no label", () => {
    expect(printFor(poses.projects, "project:zen", []).glyph).toBe("Z");
  });

  it("keeps the spoiled sheet spoiled", () => {
    expect(printFor(poses.notfound, "project:atlas", items).glyph).toBe("404");
  });

  it("clips long labels so the slug stays on the sheet", () => {
    const slug = printFor(poses.projects, "project:x", [
      {
        id: "project:x",
        label: "A very long project name that runs on",
        weight: 1,
      },
    ]).slug;
    expect(slug.length).toBeLessThanOrEqual("SIGNATURE  /  ".length + 28);
  });
});
