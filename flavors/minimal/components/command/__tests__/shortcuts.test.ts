import { describe, expect, it } from "vitest";

import { goKeyFor, goKeys } from "../shortcuts";

describe("goKeys", () => {
  it("covers every primary page once", () => {
    expect(Object.values(goKeys)).toEqual([
      "/",
      "/work",
      "/projects",
      "/now",
      "/changelog",
      "/ask",
      "/lab",
    ]);
  });

  it("maps a page back to its key", () => {
    expect(goKeyFor("/lab")).toBe("l");
    expect(goKeyFor("/")).toBe("h");
    expect(goKeyFor("/resume")).toBeUndefined();
  });
});
