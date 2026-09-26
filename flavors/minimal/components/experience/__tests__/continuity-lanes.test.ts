import { describe, expect, it } from "vitest";

import type { Experience } from "@/lib/data/types";

import { computeContinuityLanes } from "../continuity-lanes";

function role(id: string, continuedInto?: string): Experience {
  return {
    id,
    company: id,
    title: "Engineer",
    location: "Remote",
    remote: true,
    employmentType: "full-time",
    startDate: "2024-01-01",
    body: [],
    highlights: [],
    ...(continuedInto
      ? { continuedInto: { id: continuedInto, company: continuedInto } }
      : {}),
  };
}

describe("computeContinuityLanes", () => {
  it("returns empty rows when nothing continued", () => {
    expect(computeContinuityLanes([role("a"), role("b")])).toEqual({
      rows: [[], []],
      laneCount: 0,
    });
  });

  it("gives interleaved links separate lanes, shortest nearest the rail", () => {
    // Newest first: zunta, blai, proghit (-> zunta), lightwork, mixr, fastlane (-> blai).
    const { rows, laneCount } = computeContinuityLanes([
      role("zunta"),
      role("blai"),
      role("proghit", "zunta"),
      role("lightwork"),
      role("mixr"),
      role("fastlane", "blai"),
    ]);

    expect(laneCount).toBe(2);
    expect(rows[0]).toEqual([
      { lane: 1, kind: "start", crossesInnerLane: false },
    ]);
    expect(rows[1]).toEqual([
      { lane: 1, kind: "through", crossesInnerLane: false },
      { lane: 2, kind: "start", crossesInnerLane: true },
    ]);
    expect(rows[2]).toEqual([
      { lane: 1, kind: "end", crossesInnerLane: false },
      { lane: 2, kind: "through", crossesInnerLane: false },
    ]);
    expect(rows[5]).toEqual([
      { lane: 2, kind: "end", crossesInnerLane: false },
    ]);
  });

  it("lets a chain of moves share one lane", () => {
    const { rows, laneCount } = computeContinuityLanes([
      role("c"),
      role("b", "c"),
      role("a", "b"),
    ]);
    expect(laneCount).toBe(1);
    expect(rows[1]?.map((segment) => segment.kind)).toEqual(["end", "start"]);
  });

  it("ignores links to roles that are not in the list", () => {
    const { rows, laneCount } = computeContinuityLanes([role("a", "gone")]);
    expect(laneCount).toBe(0);
    expect(rows).toEqual([[]]);
  });
});
