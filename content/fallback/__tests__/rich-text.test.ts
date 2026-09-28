import { describe, expect, it } from "vitest";

import { paragraph, richText } from "../rich-text";

describe("richText", () => {
  it("gives every block a distinct key, even with identical text", () => {
    const blocks = richText("Repeat me.", "Something else.", "Repeat me.");
    const keys = blocks.map((block) => block._key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every span and mark key within a block a distinct key", () => {
    const [first, second] = richText("Repeat me.", "Repeat me.") as {
      _key: string;
      children: { _key: string }[];
    }[];
    expect(first?._key).not.toBe(second?._key);
    expect(first?.children[0]?._key).not.toBe(second?.children[0]?._key);
  });

  it("is deterministic for the same markup and position", () => {
    expect(paragraph("Hello *world*", 2)).toEqual(
      paragraph("Hello *world*", 2)
    );
  });

  it("still keys a single paragraph built without an explicit index", () => {
    expect(paragraph("Solo.")._key).toBe(paragraph("Solo.", 0)._key);
  });
});
