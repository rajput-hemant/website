import { goKeyFor, goKeys } from "@/flavors/press/components/command/shortcuts";
import { describe, expect, it } from "vitest";

describe("press go keys", () => {
  it("numbers every sheet from 1", () => {
    expect(goKeys["1"]).toBe("/");
    expect(goKeys["2"]).toBe("/projects");
    expect(goKeyFor("/resume")).toBe("8");
    expect(Object.keys(goKeys)).toHaveLength(8);
  });
});
