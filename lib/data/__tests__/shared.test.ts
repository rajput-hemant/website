import { describe, expect, it } from "vitest";

import { optional, toDomainId, toRichText } from "../shared";

describe("toDomainId", () => {
  it("strips the seeded type prefix", () => {
    expect(toDomainId("experience-zunta", "experience")).toBe("zunta");
  });

  it("strips a drafts prefix before the type prefix", () => {
    expect(toDomainId("drafts.project-lipi", "project")).toBe("lipi");
  });

  it("leaves ids without the prefix untouched", () => {
    expect(toDomainId("a1b2c3", "project")).toBe("a1b2c3");
  });

  it("only strips the given type's prefix, and only at the start", () => {
    expect(toDomainId("project-x", "experience")).toBe("project-x");
    expect(toDomainId("my-project-x", "project")).toBe("my-project-x");
  });
});

describe("toRichText", () => {
  it("passes arrays through", () => {
    const blocks = [{ _type: "block", children: [] }];
    expect(toRichText(blocks)).toBe(blocks);
  });

  it.each([null, undefined, "text", {}])(
    "turns %s into an empty array",
    (value) => {
      expect(toRichText(value)).toEqual([]);
    }
  );
});

describe("optional", () => {
  it("turns null into undefined", () => {
    expect(optional(null)).toBeUndefined();
  });

  it("keeps falsy non-null values", () => {
    expect(optional("")).toBe("");
    expect(optional(0)).toBe(0);
    expect(optional(false)).toBe(false);
  });
});
