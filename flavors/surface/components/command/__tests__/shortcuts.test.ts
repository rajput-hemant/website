import { describe, expect, it } from "vitest";

import { goKeyFor, goKeys } from "../shortcuts";

describe("goKeys", () => {
  it("covers every primary jump once", () => {
    expect(Object.values(goKeys)).toEqual([
      "/",
      "/projects",
      "/work",
      "/lab",
      "/about",
      "/now",
      "/now#log",
    ]);
  });

  it("maps a page back to its key", () => {
    expect(goKeyFor("/lab")).toBe("l");
    expect(goKeyFor("/")).toBe("h");
    expect(goKeyFor("/resume")).toBeUndefined();
  });
});
