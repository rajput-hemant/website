import { describe, expect, it } from "vitest";

import { groupEducation } from "../education";
import type { Education } from "../types";

const entry = (overrides: Partial<Education> & { id: string }): Education => ({
  institution: "GLA University",
  degree: "B.Tech",
  location: "Mathura, Uttar Pradesh",
  endYear: 2024,
  ...overrides,
});

describe("groupEducation", () => {
  it("returns no groups for no entries", () => {
    expect(groupEducation([])).toEqual([]);
  });

  it("puts qualifications from one school under a single group", () => {
    const intermediate = entry({
      id: "intermediate",
      institution: "Gyan Deep Shiksha Bharati",
      degree: "Intermediate",
      endYear: 2020,
    });
    const matriculation = entry({
      id: "matriculation",
      institution: "Gyan Deep Shiksha Bharati",
      degree: "Matriculation",
      endYear: 2018,
    });
    expect(groupEducation([intermediate, matriculation])).toEqual([
      {
        institution: "Gyan Deep Shiksha Bharati",
        location: "Mathura, Uttar Pradesh",
        entries: [intermediate, matriculation],
      },
    ]);
  });

  it("orders groups by each school's first appearance and keeps entry order", () => {
    const a1 = entry({ id: "a1", institution: "A" });
    const b1 = entry({ id: "b1", institution: "B" });
    const a2 = entry({ id: "a2", institution: "A" });
    const groups = groupEducation([a1, b1, a2]);
    expect(groups.map((group) => group.institution)).toEqual(["A", "B"]);
    expect(groups[0]?.entries.map((item) => item.id)).toEqual(["a1", "a2"]);
  });

  it("matches school names regardless of case and spacing", () => {
    const groups = groupEducation([
      entry({ id: "one", institution: "Gyan Deep  Shiksha Bharati" }),
      entry({ id: "two", institution: " gyan deep shiksha bharati" }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.institution).toBe("Gyan Deep  Shiksha Bharati");
  });

  it("uses the first entry's location for the group", () => {
    const groups = groupEducation([
      entry({ id: "one", location: "Chaumuhan, Mathura" }),
      entry({ id: "two", location: "Mathura" }),
    ]);
    expect(groups[0]?.location).toBe("Chaumuhan, Mathura");
  });
});
