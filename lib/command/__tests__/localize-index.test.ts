import { describe, expect, it } from "vitest";

import { route } from "@/lib/route";

import { localizeSearchIndex } from "../localize-index";
import type { SearchIndex } from "../types";

const index: SearchIndex = {
  email: "a@b.dev",
  entries: [
    {
      id: "update:1",
      title: "Shipped",
      group: "Changelog",
      href: route("/changelog#2024"),
      keywords: ["work", "2024"],
    },
    {
      id: "page:/work",
      title: "Work",
      group: "Pages",
      href: route("/work"),
      keywords: [],
    },
  ],
};

describe("localizeSearchIndex", () => {
  it("leaves Minimal changelog hrefs on /changelog", () => {
    expect(localizeSearchIndex(index, "minimal")).toBe(index);
  });

  it("rewrites changelog hrefs for Drawing Set", () => {
    const localized = localizeSearchIndex(index, "drawing-set");
    expect(localized.entries[0]?.href).toBe("/now#log-2024");
    expect(localized.entries[1]).toEqual(index.entries[1]);
  });
});
