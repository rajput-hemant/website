import { describe, expect, it } from "vitest";

import { digitOffset, toCounterGlyphs } from "../digits";

describe("toCounterGlyphs", () => {
  it("splits a grouped number into digit strips and separators", () => {
    expect(toCounterGlyphs(12_408)).toEqual([
      { kind: "digit", digit: 1, key: "p5" },
      { kind: "digit", digit: 2, key: "p4" },
      { kind: "literal", char: ",", key: "p3" },
      { kind: "digit", digit: 4, key: "p2" },
      { kind: "digit", digit: 0, key: "p1" },
      { kind: "digit", digit: 8, key: "p0" },
    ]);
  });

  it("handles zero and small numbers without separators", () => {
    expect(toCounterGlyphs(0)).toEqual([
      { kind: "digit", digit: 0, key: "p0" },
    ]);
    expect(toCounterGlyphs(7).map((glyph) => glyph.kind)).toEqual(["digit"]);
  });

  it("keys glyphs from the right, so existing strips survive a new digit", () => {
    const before = toCounterGlyphs(999).map((glyph) => glyph.key);
    const after = toCounterGlyphs(1_000).map((glyph) => glyph.key);
    expect(after.slice(-3)).toEqual(before);
    expect(new Set(after).size).toBe(after.length);
  });

  it("groups millions", () => {
    const glyphs = toCounterGlyphs(1_234_567);
    expect(
      glyphs.map((g) => (g.kind === "digit" ? g.digit : g.char)).join("")
    ).toBe("1,234,567");
  });

  it("uses a given formatter", () => {
    const format = new Intl.NumberFormat("de-DE");
    const glyphs = toCounterGlyphs(12_408, format);
    expect(glyphs[2]).toEqual({ kind: "literal", char: ".", key: "p3" });
  });
});

describe("digitOffset", () => {
  it("moves the 0-9 strip up one em per digit", () => {
    expect(digitOffset(0)).toBe("translateY(0)");
    expect(digitOffset(1)).toBe("translateY(-1em)");
    expect(digitOffset(9)).toBe("translateY(-9em)");
  });
});
