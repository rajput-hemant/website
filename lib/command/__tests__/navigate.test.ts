// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { route } from "@/lib/route";

import { navigateTo } from "../navigate";

afterEach(() => {
  window.location.hash = "";
});

describe("navigateTo", () => {
  it("pushes other pages through the router", () => {
    const push = vi.fn();
    navigateTo(route("/elsewhere"), push);
    expect(push).toHaveBeenCalledWith("/elsewhere");
  });

  it("sets the hash for a target on this page", () => {
    const push = vi.fn();
    navigateTo(route(`${window.location.pathname}#skills`), push);
    expect(push).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("#skills");
  });
});
