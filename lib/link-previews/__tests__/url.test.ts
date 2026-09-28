import { describe, expect, it } from "vitest";

import { mapWithConcurrency } from "../fetch";
import {
  displayDomain,
  githubOpenGraphImage,
  normalizeExternalUrl,
  normalizeInternalPath,
  richTextHrefs,
  withGithubFallback,
} from "../url";

describe("normalizeExternalUrl", () => {
  it("matches what an anchor's href property reports", () => {
    expect(normalizeExternalUrl("https://example.com")).toBe(
      "https://example.com/"
    );
    expect(normalizeExternalUrl("https://Example.com/a?b=1#top")).toBe(
      "https://example.com/a?b=1"
    );
  });

  it("rejects non-http URLs and garbage", () => {
    expect(normalizeExternalUrl("mailto:a@b.c")).toBeNull();
    expect(normalizeExternalUrl("/relative")).toBeNull();
    expect(normalizeExternalUrl("not a url")).toBeNull();
  });
});

describe("normalizeInternalPath", () => {
  it("strips trailing slashes but keeps the root", () => {
    expect(normalizeInternalPath("/lab/")).toBe("/lab");
    expect(normalizeInternalPath("/")).toBe("/");
    expect(normalizeInternalPath("")).toBe("/");
  });
});

describe("displayDomain", () => {
  it("drops www", () => {
    expect(displayDomain("https://www.linkedin.com/in/x")).toBe("linkedin.com");
    expect(displayDomain("https://docs.example.dev/")).toBe("docs.example.dev");
  });
});

describe("githubOpenGraphImage", () => {
  it("builds a card URL for repositories only", () => {
    expect(githubOpenGraphImage("https://github.com/vercel/next.js")).toBe(
      "https://opengraph.githubassets.com/1/vercel/next.js"
    );
    expect(
      githubOpenGraphImage("https://github.com/owner/repo.git/tree/main")
    ).toBe("https://opengraph.githubassets.com/1/owner/repo");
    expect(githubOpenGraphImage("https://github.com/rajput-hemant")).toBe(
      undefined
    );
    expect(githubOpenGraphImage("https://github.com/sponsors/someone")).toBe(
      undefined
    );
    expect(githubOpenGraphImage("https://gitlab.com/a/b")).toBe(undefined);
  });

  it("keeps an existing image", () => {
    expect(
      withGithubFallback("https://github.com/a/b", { image: "https://x/y.png" })
    ).toEqual({ image: "https://x/y.png" });
    expect(withGithubFallback("https://github.com/a/b", {})).toEqual({
      image: "https://opengraph.githubassets.com/1/a/b",
    });
  });
});

describe("richTextHrefs", () => {
  it("collects string hrefs from mark definitions", () => {
    expect(
      richTextHrefs([
        { markDefs: [{ href: "https://a.dev" }, { href: 3 }, {}] },
        { markDefs: null },
        {},
      ])
    ).toEqual(["https://a.dev"]);
    expect(richTextHrefs(undefined)).toEqual([]);
  });
});

describe("mapWithConcurrency", () => {
  it("keeps order and never exceeds the limit", async () => {
    let inFlight = 0;
    let peak = 0;
    const result = await mapWithConcurrency([5, 1, 4, 2, 3], 2, async (n) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, n));
      inFlight--;
      return n * 10;
    });
    expect(result).toEqual([50, 10, 40, 20, 30]);
    expect(peak).toBe(2);
  });
});
