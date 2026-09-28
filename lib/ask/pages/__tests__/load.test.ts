import { describe, expect, it } from "vitest";

import { askListMetadata, resolveAskPage } from "../load";

describe("ask page loaders", () => {
  it("rejects segments that aren't page numbers", async () => {
    expect(await resolveAskPage("abc")).toBeNull();
    expect(await resolveAskPage("1")).toBeNull();
  });

  it("returns no metadata for a page that doesn't exist", async () => {
    expect(await askListMetadata("9999")).toEqual({});
  });
});
