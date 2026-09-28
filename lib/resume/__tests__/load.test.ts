import { describe, expect, it } from "vitest";

import { loadResumeData } from "../load";

describe("loadResumeData", () => {
  it("keeps only featured projects", async () => {
    const data = await loadResumeData();
    expect(data.projects.length).toBeGreaterThan(0);
    expect(data.projects.every((project) => project.featured)).toBe(true);
    expect(data.experience.length).toBeGreaterThan(0);
  });
});
