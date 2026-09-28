import { describe, expect, it } from "vitest";

import { workPageMeta } from "../work-page-meta";

describe("workPageMeta", () => {
  it("labels role count and prefixes the since date", () => {
    expect(
      workPageMeta([
        { startDate: "2024-06-01" },
        { startDate: "2020-01-01" },
      ])
    ).toEqual([
      { label: "Roles", value: "2 roles" },
      { label: "Since", value: "Since Jan 2020" },
    ]);
  });

  it("uses the singular role label", () => {
    expect(workPageMeta([{ startDate: "2022-03-01" }])).toEqual([
      { label: "Roles", value: "1 role" },
      { label: "Since", value: "Since Mar 2022" },
    ]);
  });
});
