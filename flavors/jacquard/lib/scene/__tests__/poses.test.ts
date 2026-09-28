import {
  asSceneRoute,
  cellAt,
  decodeWeave,
  draftWeave,
  encodeWeave,
  hotIds,
  logWeave,
  poses,
  threadWeave,
  twillWeave,
} from "@/flavors/jacquard/lib/scene/poses";
import { buildDraft, loomThreads, pickFor } from "@/flavors/jacquard/lib/weave";
import { describe, expect, it } from "vitest";

import { changelog } from "@/content/fallback/changelog";
import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";

const draft = buildDraft(projects);

describe("poses", () => {
  it("narrows any route to one of ours", () => {
    expect(asSceneRoute("work")).toBe("work");
    expect(asSceneRoute("drawer-3")).toBe("home");
    expect(asSceneRoute("toString")).toBe("home");
  });

  it("breaks an end only on the 404", () => {
    const broken = Object.entries(poses).filter(([, pose]) => pose.broken);
    expect(broken.map(([route]) => route)).toEqual(["notfound"]);
  });
});

describe("draftWeave", () => {
  const weave = draftWeave(draft);

  it("is the draft: ends across, one row per pick", () => {
    expect(weave.w).toBe(29);
    expect(weave.h).toBe(9);
    expect(weave.cells).toHaveLength(29 * 9);
    // Infinitunes raises Next.js, end 0.
    expect(cellAt(weave, 0, 0)).toBe(0);
    // leetcode (pick 2) does not.
    expect(cellAt(weave, 0, 1)).toBe(-1);
  });

  it("round-trips through the board attribute", () => {
    expect(decodeWeave(encodeWeave(weave))).toEqual(weave);
  });

  it("lights a pick's ends in every row", () => {
    const jio = pickFor(draft, "jiosaavn-api");
    const hot = hotIds(weave, `pick:${jio?.index ?? -1}`);
    expect([...hot].sort((a, b) => a - b)).toEqual(jio?.ends);
    expect(hotIds(weave, "end:4")).toEqual(new Set([4]));
    expect(hotIds(weave, null).size).toBe(0);
  });
});

describe("decodeWeave", () => {
  it.each([
    ["missing", null],
    ["not JSON", "{"],
    ["the wrong shape", JSON.stringify({ w: 2, h: 1 })],
    [
      "cells of the wrong length",
      JSON.stringify({ w: 2, h: 2, ids: [], kinds: [], rows: [], cells: "." }),
    ],
  ])("rejects a board that is %s", (_label, value) => {
    expect(decodeWeave(value)).toBeNull();
  });
});

describe("other weaves", () => {
  it("weaves a project's twill from its pick alone", () => {
    const weave = twillWeave(draft, pickFor(draft, "shellai"));
    const raised = [...weave.cells].filter((c) => c !== ".");
    expect(raised).toHaveLength(2 * 29);
  });

  it("weaves one row per role, and one per log entry", () => {
    const threads = threadWeave(loomThreads(experience, new Date(2026, 8, 27)));
    expect(threads.h).toBe(6);
    expect(threads.rows[0]).toBe("role:zunta");
    expect(decodeWeave(encodeWeave(threads))).not.toBeNull();
    const log = logWeave(changelog);
    expect(log.h).toBe(Math.min(24, changelog.length));
  });
});
