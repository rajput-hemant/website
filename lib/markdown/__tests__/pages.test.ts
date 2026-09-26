import { describe, expect, it } from "vitest";

import { site } from "@/content/site";

import { getMarkdownSlugs, renderMarkdown } from "..";

describe("page markdown (fallback content)", () => {
  it("lists every mirrored page", async () => {
    const slugs = await getMarkdownSlugs();
    expect(slugs).toEqual(
      expect.arrayContaining([
        "index",
        "work",
        "projects",
        "now",
        "about",
        "resume",
        "ask",
        "lab",
      ])
    );
  });

  it("renders /work with a title, canonical link and every section", async () => {
    const markdown = await renderMarkdown("work");
    expect(markdown).not.toBeNull();
    const lines = (markdown ?? "").split("\n");
    expect(lines[0]).toBe("# Work");
    expect(lines[2]).toContain(`](${site.url}/work)`);
    expect(markdown).toContain("## Experience");
    expect(markdown).toContain(
      "### Fullstack Engineer · [Zunta](https://zunta.com)"
    );
    expect(markdown?.endsWith("\n")).toBe(true);
    expect(markdown).not.toMatch(/\n{3,}/);
  });

  it("renders /about with bio, skills, education and contact", async () => {
    const markdown = await renderMarkdown("about");
    expect(markdown).not.toBeNull();
    expect((markdown ?? "").split("\n")[0]).toBe("# About");
    expect(markdown).toContain("## Skills");
    expect(markdown).toContain("## Education");
    expect(markdown).toContain("## Contact");
    expect(markdown?.endsWith("\n")).toBe(true);
    expect(markdown).not.toMatch(/\n{3,}/);
  });

  it("renders /now with the log folded in", async () => {
    const markdown = await renderMarkdown("now");
    expect(markdown).toContain("## The log");
  });

  it("renders every page starting with a level-one heading", async () => {
    for (const slug of await getMarkdownSlugs()) {
      const markdown = await renderMarkdown(slug);
      expect(markdown, slug).toMatch(/^# \S/);
      expect(markdown, slug).not.toContain("undefined");
    }
  });

  it("links the home page to the other mirrors", async () => {
    const markdown = await renderMarkdown("index");
    expect(markdown).toMatch(/^# Hemant Rajput\n/);
    expect(markdown).toContain(`(${site.url}/work.md)`);
  });

  it("returns null for unknown pages", async () => {
    expect(await renderMarkdown("nope")).toBeNull();
    expect(await renderMarkdown("ask/unknown")).toBeNull();
    expect(await renderMarkdown("work/extra")).toBeNull();
  });
});
