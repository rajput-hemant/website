import { describe, expect, it } from "vitest";

import { localizeSearchIndex } from "../localize-index";
import type { SearchIndex } from "../types";

const index: SearchIndex = {
  email: "a@b.dev",
  entries: [
    {
      id: "update:1",
      title: "Shipped",
      group: "Changelog",
      href: "/changelog#2024",
      keywords: ["work", "2024"],
    },
    {
      id: "page:/work",
      title: "Work",
      group: "Pages",
      href: "/work",
      keywords: [],
    },
  ],
};

describe("localizeSearchIndex", () => {
  it("leaves Minimal changelog hrefs on /changelog", () => {
    expect(localizeSearchIndex(index, (year) => `/changelog#${year}`)).toBe(
      index
    );
  });

  it("uses the supplied route for changelog entries", () => {
    const localized = localizeSearchIndex(index, (year) => `/now#log-${year}`);
    expect(localized.entries[0]?.href).toBe("/now#log-2024");
    expect(localized.entries[1]).toEqual(index.entries[1]);
  });
});
