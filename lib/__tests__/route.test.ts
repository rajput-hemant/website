import { describe, expect, it } from "vitest";

import { route } from "../route";

describe("route", () => {
  it.each(["/", "/projects", "/work#zunta", "/now#log-2026", "/ask?page=2"])(
    "accepts the same-site path %s",
    (path) => {
      expect(route(path)).toBe(path);
    }
  );

  it.each(["projects", "//evil.example", "https://evil.example", ""])(
    "rejects %j",
    (path) => {
      expect(() => route(path)).toThrow(TypeError);
    }
  );
});
