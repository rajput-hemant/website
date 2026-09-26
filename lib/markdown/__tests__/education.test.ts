import { describe, expect, it } from "vitest";

import type { Education } from "@/lib/data/types";

import { educationList } from "../fragments";

const entry = (overrides: Partial<Education> & { id: string }): Education => ({
  institution: "Gyan Deep Shiksha Bharati",
  degree: "Matriculation",
  location: "Mathura, Uttar Pradesh",
  endYear: 2018,
  ...overrides,
});

describe("educationList", () => {
  it("lists each school once with its qualifications nested", () => {
    const markdown = educationList([
      entry({
        id: "btech",
        institution: "GLA University",
        degree: "B.Tech",
        location: "Chaumuhan, Mathura",
        startYear: 2020,
        endYear: 2024,
        score: "CPI 7.22",
      }),
      entry({
        id: "inter",
        degree: "Intermediate (CBSE)",
        endYear: 2020,
        score: "75.8%",
      }),
      entry({ id: "matric", startYear: 2018, score: "87.6%" }),
    ]);
    expect(markdown).toBe(
      [
        "- **GLA University** · Chaumuhan, Mathura",
        "  - B.Tech · 2020 – 2024 · CPI 7.22",
        "- **Gyan Deep Shiksha Bharati** · Mathura, Uttar Pradesh",
        "  - Intermediate (CBSE) · 2020 · 75.8%",
        "  - Matriculation · 2018 · 87.6%",
      ].join("\n")
    );
  });

  it("escapes markdown in school and degree names", () => {
    expect(
      educationList([entry({ id: "x", institution: "*Star* School" })])
    ).toContain("**\\*Star\\* School**");
  });
});
