import { describe, expect, it } from "vitest";

import { fitsTwoColumns, SHORT_ITEM_MAX } from "../now-layout";

const item = (length: number) => ({ text: "x".repeat(length) });

describe("fitsTwoColumns", () => {
  it("splits four or more short items", () => {
    expect(fitsTwoColumns([item(20), item(30), item(40), item(50)])).toBe(true);
  });

  it("keeps one column when any item is long", () => {
    expect(
      fitsTwoColumns([item(20), item(30), item(40), item(SHORT_ITEM_MAX + 1)])
    ).toBe(false);
  });

  it("keeps one column for short lists", () => {
    expect(fitsTwoColumns([item(10), item(10), item(10)])).toBe(false);
    expect(fitsTwoColumns([])).toBe(false);
  });
});
