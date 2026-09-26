import { describe, expect, it } from "vitest";

import { routeFlavor } from "@/lib/flavor-routing";

const route = (path: string, cookie?: string) => {
  const url = new URL(path, "https://example.test");
  return routeFlavor({
    pathname: url.pathname,
    searchParams: url.searchParams,
    cookie,
  });
};

describe("routeFlavor", () => {
  it("shows the picker on a first visit to the home page only", () => {
    expect(route("/")).toEqual({ type: "rewrite", to: "/flavors" });
    expect(route("/projects")).toEqual({
      type: "rewrite",
      to: "/f/minimal/projects",
    });
  });

  it("serves the chosen edition, ignoring unknown or future ones", () => {
    expect(route("/", "drawing-set")).toEqual({
      type: "rewrite",
      to: "/f/drawing-set",
    });
    expect(route("/work", "calibre")).toEqual({
      type: "rewrite",
      to: "/f/minimal/work",
    });
  });

  it("sets the edition from ?flavor= and redirects to the clean URL", () => {
    expect(route("/work?flavor=drawing-set&x=1")).toEqual({
      type: "redirect",
      to: "/work?x=1",
      flavor: "drawing-set",
    });
    expect(route("/?flavor=nope")).toEqual({ type: "rewrite", to: "/flavors" });
  });

  it("leaves the picker and the internal trees alone", () => {
    expect(route("/flavors")).toEqual({ type: "next" });
    expect(route("/f/minimal/ask/opengraph-image")).toEqual({ type: "next" });
  });
});
