import {
  raises,
  readout,
  sameFocus,
  sceneId,
  summarize,
} from "@/flavors/jacquard/lib/focus";
import { buildDraft } from "@/flavors/jacquard/lib/weave";
import { describe, expect, it } from "vitest";

import { projects } from "@/content/fallback/projects";

const summary = summarize(buildDraft(projects));

describe("readout", () => {
  it("describes a pick and the ends it raises", () => {
    expect(readout(summary, { type: "pick", i: 3 })).toBe(
      "Pick 04 · JioSaavn API, 2023 · 3 ends raised: TypeScript, Hono, Bun."
    );
  });

  it("describes an end and every pick it is raised in", () => {
    expect(readout(summary, { type: "end", i: 1 })).toMatch(
      /^End 02 · TypeScript · Language · raised in 4 of 9 picks: Infinitunes, JioSaavn API, Lipi, rajputhemant\.me\.$/
    );
  });

  it("rests without a focus", () => {
    expect(readout(summary, null)).toBeNull();
    expect(readout(summary, { type: "pick", i: 99 })).toBeNull();
  });
});

describe("focus helpers", () => {
  it("compares, names and raises", () => {
    expect(sameFocus({ type: "end", i: 1 }, { type: "end", i: 1 })).toBe(true);
    expect(sameFocus({ type: "end", i: 1 }, { type: "pick", i: 1 })).toBe(
      false
    );
    expect(sameFocus(null, null)).toBe(true);
    expect(sceneId({ type: "pick", i: 2 })).toBe("pick:2");
    expect(sceneId(null)).toBeNull();
    expect(raises(summary, { type: "pick", i: 0 }, 0)).toBe(true);
    expect(raises(summary, { type: "end", i: 5 }, 5)).toBe(true);
    expect(raises(summary, null, 5)).toBe(false);
  });
});
