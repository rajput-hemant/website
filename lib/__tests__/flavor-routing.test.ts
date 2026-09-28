import { describe, expect, it } from "vitest";

import { routeFlavor } from "@/lib/flavor-routing";

const isFlavor = (value: unknown): value is "minimal" | "drawing-set" =>
  value === "minimal" || value === "drawing-set";

const route = (path: string, cookie?: string) => {
  const url = new URL(path, "https://example.test");
  return routeFlavor(
    {
      pathname: url.pathname,
      searchParams: url.searchParams,
      cookie,
    },
    {
      defaultFlavor: "minimal",
      isLiveFlavor: isFlavor,
    }
  );
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

  it("uses only the supplied flavor predicate and default", () => {
    const url = new URL("/projects?flavor=custom&x=1", "https://example.test");
    const isCustomFlavor = (value: unknown): value is "custom" =>
      value === "custom";

    expect(
      routeFlavor(
        {
          pathname: url.pathname,
          searchParams: url.searchParams,
          cookie: undefined,
        },
        { defaultFlavor: "custom", isLiveFlavor: isCustomFlavor }
      )
    ).toEqual({ type: "redirect", to: "/projects?x=1", flavor: "custom" });

    const unknownUrl = new URL(
      "/work?flavor=drawing-set",
      "https://example.test"
    );
    expect(
      routeFlavor(
        {
          pathname: unknownUrl.pathname,
          searchParams: unknownUrl.searchParams,
          cookie: "drawing-set",
        },
        { defaultFlavor: "custom", isLiveFlavor: isCustomFlavor }
      )
    ).toEqual({ type: "rewrite", to: "/f/custom/work" });
  });
});

describe("routeFlavor with a pinned edition", () => {
  const pinned = (path: string, cookie?: string) => {
    const url = new URL(path, "https://example.test");
    return routeFlavor(
      { pathname: url.pathname, searchParams: url.searchParams, cookie },
      {
        defaultFlavor: "minimal",
        isLiveFlavor: isFlavor,
        pinnedFlavor: "drawing-set",
      }
    );
  };

  it("serves the pinned edition on every page, even a first visit to home", () => {
    expect(pinned("/")).toEqual({ type: "rewrite", to: "/f/drawing-set" });
    expect(pinned("/projects")).toEqual({
      type: "rewrite",
      to: "/f/drawing-set/projects",
    });
  });

  it("ignores the cookie and ?flavor=, and never sets the cookie", () => {
    expect(pinned("/", "minimal")).toEqual({
      type: "rewrite",
      to: "/f/drawing-set",
    });
    expect(pinned("/work?flavor=minimal", "minimal")).toEqual({
      type: "rewrite",
      to: "/f/drawing-set/work",
    });
  });

  it("answers the picker with the pinned edition's 404", () => {
    expect(pinned("/flavors")).toEqual({
      type: "rewrite",
      to: "/f/drawing-set/flavors",
    });
  });

  it("redirects another edition's tree to the clean URL, without a cookie", () => {
    expect(pinned("/f/minimal/projects?x=1")).toEqual({
      type: "redirect",
      to: "/projects?x=1",
    });
    expect(pinned("/f/minimal")).toEqual({ type: "redirect", to: "/" });
    expect(pinned("/f/drawing-set/work")).toEqual({ type: "next" });
  });
});
