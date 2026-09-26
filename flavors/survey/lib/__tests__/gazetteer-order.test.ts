import {
  sortForGazetteer,
  surveyNeighbourOrder,
} from "@/flavors/survey/lib/gazetteer-order";
import { buildRelief } from "@/flavors/survey/lib/relief";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";
import type { Project } from "@/lib/data/types";

const relief = buildRelief(experience, projects, new Date(2026, 8, 20));
const undated: Project = {
  ...projects[0]!,
  id: "undated",
  slug: "undated",
  name: "Undated",
  year: null,
};

describe("surveyNeighbourOrder", () => {
  it("keeps undated projects after the east edge, not at index -1", () => {
    const order = surveyNeighbourOrder([...projects, undated], relief.sites);
    const index = order.findIndex((s) => s.slug === "undated");
    expect(index).toBe(order.length - 1);
    expect(order[index - 1]?.ref).toBeTruthy();
    expect(order[index + 1]).toBeUndefined();
  });
});

describe("sortForGazetteer", () => {
  it("sorts undated rows after dated sites", () => {
    const rows = sortForGazetteer([undated, ...projects], relief.sites);
    const firstUndated = rows.findIndex((p) => p.year == null);
    const lastDated = rows.findLastIndex((p) => p.year != null);
    expect(firstUndated).toBeGreaterThan(lastDated);
  });
});
