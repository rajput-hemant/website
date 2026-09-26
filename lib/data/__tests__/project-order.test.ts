import { describe, expect, it } from "vitest";

import { orderProjectsForCatalog } from "@/lib/data/project-order";
import type { Project } from "@/lib/data/types";

const p = (slug: string, year: number | null): Project => ({
  id: slug,
  slug,
  name: slug,
  tagline: "",
  description: [],
  stack: [],
  featured: false,
  status: "active",
  year,
});

describe("orderProjectsForCatalog", () => {
  it("lists dated projects by year, then name, with unset years last", () => {
    const ordered = orderProjectsForCatalog([
      p("undated", null),
      p("b", 2024),
      p("a", 2024),
      p("old", 2022),
    ]);
    expect(ordered.map((x) => x.slug)).toEqual(["old", "a", "b", "undated"]);
  });
});
