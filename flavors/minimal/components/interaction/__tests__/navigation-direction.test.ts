import { describe, expect, it } from "vitest";

import { navigationDirection } from "../navigation-direction";

describe("navigationDirection", () => {
  it("moves forward into detail pages", () => {
    expect(navigationDirection("/lab", "/lab/signature-field")).toBe("forward");
    expect(navigationDirection("/", "/projects")).toBe("forward");
    expect(navigationDirection("/ask", "/ask/page/2")).toBe("forward");
  });

  it("moves back towards index pages", () => {
    expect(navigationDirection("/lab/signature-field", "/lab")).toBe("back");
    expect(navigationDirection("/projects", "/")).toBe("back");
    expect(navigationDirection("/ask/some-thread", "/work")).toBe("back");
  });

  it("has no direction between siblings", () => {
    expect(navigationDirection("/work", "/projects")).toBe("none");
    expect(navigationDirection("/ask/a", "/ask/b")).toBe("none");
    expect(navigationDirection("/lab/", "/lab")).toBe("none");
  });
});
