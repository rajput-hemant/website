import { describe, expect, it } from "vitest";

import type { SceneItem } from "@/lib/scene/store";

import { clampTag, createTapGate, findDrawn, tagLabel } from "../tag";

const item = (id: string, label: string | null): SceneItem => ({
  id,
  href: `/${id}`,
  weight: 1,
  label,
  line: null,
});

describe("tagLabel", () => {
  const items = [item("study:grid", "Grid study"), item("role:a", null)];

  it("prefers the hit's own name", () => {
    expect(tagLabel({ id: "drawer:01", label: "Projects" }, items)).toBe(
      "Projects"
    );
  });

  it("falls back to the page item's data-scene-label", () => {
    expect(tagLabel({ id: "study:grid" }, items)).toBe("Grid study");
  });

  it("names nothing without a label", () => {
    expect(tagLabel({ id: "role:a" }, items)).toBeNull();
    expect(tagLabel({ id: "missing" }, items)).toBeNull();
    expect(tagLabel({ id: null }, items)).toBeNull();
  });
});

describe("clampTag", () => {
  it("keeps the tag inside the slot", () => {
    expect(clampTag(500, 100, 1000)).toBe(500);
    expect(clampTag(10, 100, 1000)).toBe(54);
    expect(clampTag(990, 100, 1000)).toBe(946);
  });

  it("centres a tag wider than the slot", () => {
    expect(clampTag(10, 300, 200)).toBe(100);
  });
});

describe("createTapGate", () => {
  it("lets a mouse click go at once", () => {
    const gate = createTapGate();
    gate.down("mouse");
    expect(gate.go("drawer:01")).toBe(true);
    expect(gate.armed).toBeNull();
  });

  it("arms on the first touch tap and goes on the second", () => {
    const gate = createTapGate();
    gate.down("touch");
    expect(gate.go("drawer:01")).toBe(false);
    expect(gate.armed).toBe("drawer:01");
    gate.down("touch");
    expect(gate.go("drawer:01")).toBe(true);
    expect(gate.armed).toBeNull();
  });

  it("moves the arm to another part instead of going", () => {
    const gate = createTapGate();
    gate.down("touch");
    gate.go("drawer:01");
    expect(gate.go("drawer:02")).toBe(false);
    expect(gate.armed).toBe("drawer:02");
  });

  it("disarms and reports what was armed", () => {
    const gate = createTapGate();
    gate.down("touch");
    gate.go("project:a");
    expect(gate.disarm()).toBe("project:a");
    expect(gate.armed).toBeNull();
    expect(gate.disarm()).toBeNull();
  });
});

describe("findDrawn", () => {
  const hit = (id: string, href: string | null = `/${id}`) => ({ id, href });
  const sheets = {
    drawn: true,
    count: 2,
    pick: (i: number) => hit(["project:a", "project:b"][i] ?? ""),
  };

  it("finds a focused row's drawing while it plots in, before it is pickable", () => {
    expect(findDrawn([sheets], "project:b")).toMatchObject({
      i: 1,
      hit: { id: "project:b" },
    });
  });

  it("skips parts that are not drawn on this route", () => {
    expect(findDrawn([{ ...sheets, drawn: false }], "project:a")).toBeNull();
  });

  it("skips instances past the drawn count and parts that link nowhere", () => {
    expect(findDrawn([{ ...sheets, count: 1 }], "project:b")).toBeNull();
    const dead = { drawn: true, count: 1, pick: () => hit("arm", null) };
    expect(findDrawn([dead], "arm")).toBeNull();
  });
});
