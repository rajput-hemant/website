import { describe, expect, it } from "vitest";

import { askEntrySlug, isMirrorSlug, markdownSlug } from "../slugs";

describe("mirror slugs", () => {
  it("maps page paths to slugs", () => {
    expect(markdownSlug("/")).toBe("index");
    expect(markdownSlug("/work/")).toBe("work");
    expect(markdownSlug("/ask/AbC123xy")).toBe("ask/AbC123xy");
  });

  it("accepts known pages and well-formed ask permalinks only", () => {
    expect(isMirrorSlug("index")).toBe(true);
    expect(isMirrorSlug("work")).toBe(true);
    expect(isMirrorSlug("ask/AbC1_3-y")).toBe(true);
    expect(isMirrorSlug("ask/short")).toBe(false);
    expect(isMirrorSlug("ask/AbC123xy/extra")).toBe(false);
    expect(isMirrorSlug("studio")).toBe(false);
    expect(isMirrorSlug("lab/signature-field")).toBe(false);
  });

  it("extracts the ask permalink id", () => {
    expect(askEntrySlug("ask/AbC123xy")).toBe("AbC123xy");
    expect(askEntrySlug("work")).toBeUndefined();
  });
});
