import { Gazetteer } from "@/flavors/survey/components/projects/gazetteer";
import { buildRelief } from "@/flavors/survey/lib/relief";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";
import type { Project } from "@/lib/data/types";

const relief = buildRelief(experience, projects, new Date(2026, 8, 20));

const undated: Project = {
  ...projects[0]!,
  id: "undated",
  slug: "undated",
  name: "Undated site",
  year: null,
};

describe("Gazetteer", () => {
  it("does not print a survey year of zero for an unset Sanity year", () => {
    const html = renderToStaticMarkup(
      <Gazetteer relief={relief} projects={[undated]} />
    );
    expect(html).toContain("Undated site");
    expect(html).not.toContain(", since 0");
    expect(html).not.toMatch(/>0</);
  });
});
