// @vitest-environment jsdom
import { runInThisContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";

import { platformScript } from "../platform";

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.platform;
});

function runOn(userAgent: string) {
  vi.stubGlobal("navigator", { userAgent });
  runInThisContext(platformScript);
  return document.documentElement.dataset.platform;
}

describe("platformScript", () => {
  it("marks Apple platforms", () => {
    expect(runOn("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(
      "apple"
    );
    expect(
      runOn("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")
    ).toBe("apple");
  });

  it("leaves other platforms unmarked", () => {
    expect(runOn("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBeUndefined();
  });
});
