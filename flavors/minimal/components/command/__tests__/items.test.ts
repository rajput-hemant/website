import { describe, expect, it } from "vitest";

import { buildActions } from "../items";

describe("buildActions", () => {
  it("adds copy email only with an email, and markdown only for mirrored pages", () => {
    expect(buildActions({}).map((a) => a.action)).toEqual([
      "theme",
      "customize",
    ]);
    expect(
      buildActions({ email: "a@b.c", markdownPath: "/work.md" }).map(
        (a) => a.action
      )
    ).toEqual(["copy-email", "theme", "customize", "markdown"]);
  });
});
