import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { parseLinkPreview } from "../parse";

const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

describe("parseLinkPreview", () => {
  it("prefers Open Graph tags and ignores comments, scripts and <body>", () => {
    expect(
      parseLinkPreview(
        fixture("github-repo.txt"),
        "https://github.com/rajput-hemant/nextjs-template"
      )
    ).toEqual({
      title:
        "GitHub - rajput-hemant/nextjs-template: A template for Next.js & Tailwind",
      description:
        "A template for Next.js &amp; Tailwind — batteries included.",
      image:
        "https://opengraph.githubassets.com/abc123/rajput-hemant/nextjs-template",
      siteName: "GitHub",
    });
  });

  it("reads Twitter tags in any attribute order and quoting, resolving against <base>", () => {
    expect(
      parseLinkPreview(
        fixture("relative-image.txt"),
        "https://studio.example.com/work/page"
      )
    ).toEqual({
      title: 'Relative "Studio"',
      description: "Lots of whitespace",
      image: "https://studio.example.com/assets/cards/hero.png?v=2&w=1200",
      siteName: "Unquoted",
    });
  });

  it("falls back to <title> and <link rel=image_src>", () => {
    expect(
      parseLinkPreview(fixture("title-only.txt"), "https://example.org/a/b")
    ).toEqual({
      title: "Just a title",
      image: "https://cdn.example.org/share.jpg",
    });
  });

  it("drops unsafe images, empty values and invalid entities", () => {
    expect(
      parseLinkPreview(fixture("hostile.txt"), "https://example.org/")
    ).toEqual({
      title: "Fallback title",
      description: "&#0; &bogus; 😀 ok",
    });
  });

  it("returns an empty preview for non-HTML input", () => {
    expect(parseLinkPreview("", "https://example.org/")).toEqual({});
    expect(
      parseLinkPreview('{"og:title": "json"}', "https://example.org/")
    ).toEqual({});
  });

  it("truncates long values at a word boundary", () => {
    const long = "word ".repeat(100);
    const { description } = parseLinkPreview(
      `<meta name="description" content="${long}">`,
      "https://example.org/"
    );
    expect(description?.length).toBeLessThanOrEqual(240);
    expect(description).toMatch(/word…$/);
  });

  it("uses the first occurrence of a repeated tag", () => {
    const html =
      '<meta property="og:image" content="/one.png"><meta property="og:image" content="/two.png">';
    expect(parseLinkPreview(html, "https://example.org/x").image).toBe(
      "https://example.org/one.png"
    );
  });
});
