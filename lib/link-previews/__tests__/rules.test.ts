import { describe, expect, it } from "vitest";

import { previewableLink, siteHostAliases, type LinkContext } from "../rules";

const context: LinkContext = {
  origin: "http://localhost:3000",
  siteHosts: siteHostAliases("https://rajputhemant.dev"),
  currentPath: "/work",
};

const check = (href: string, overrides: Partial<LinkContext> = {}) =>
  previewableLink(href, { ...context, ...overrides });

describe("siteHostAliases", () => {
  it("pairs a bare host with its www alias and back", () => {
    expect(siteHostAliases("https://example.com")).toEqual([
      "example.com",
      "www.example.com",
    ]);
    expect(siteHostAliases("https://www.example.com/")).toEqual([
      "www.example.com",
      "example.com",
    ]);
  });

  it("returns nothing for an invalid URL", () => {
    expect(siteHostAliases("not a url")).toEqual([]);
  });
});

describe("previewableLink", () => {
  it("previews internal subpages by normalised path", () => {
    expect(check("/projects/")).toEqual({ external: false, key: "/projects" });
    expect(check("/lab/signature-field")).toEqual({
      external: false,
      key: "/lab/signature-field",
    });
    expect(check("/ask/hello-there?x=1#reply")).toEqual({
      external: false,
      key: "/ask/hello-there",
    });
  });

  it("previews external content pages by normalised URL", () => {
    expect(check("https://github.com/a/b#readme")).toEqual({
      external: true,
      key: "https://github.com/a/b",
    });
    expect(check("https://zunta.com")).toEqual({
      external: true,
      key: "https://zunta.com/",
    });
  });

  describe("home", () => {
    it.each([
      ["relative root", "/"],
      ["this origin", "http://localhost:3000/"],
      ["this origin with a hash", "http://localhost:3000/#top"],
      ["the canonical host", "https://rajputhemant.dev"],
      ["the www alias", "https://www.rajputhemant.dev/"],
      ["the canonical host over http", "http://rajputhemant.dev/?ref=x"],
    ])("skips %s", (_label, href) => {
      expect(check(href)).toBeNull();
    });

    it("treats other paths on a host alias as internal pages", () => {
      expect(check("https://www.rajputhemant.dev/lab")).toEqual({
        external: false,
        key: "/lab",
      });
    });
  });

  it("skips the current page and its anchors", () => {
    expect(check("/work")).toBeNull();
    expect(check("/work/")).toBeNull();
    expect(check("http://localhost:3000/work#zunta")).toBeNull();
    expect(check("/work#zunta")).toBeNull();
    expect(check("/work", { currentPath: undefined })).toEqual({
      external: false,
      key: "/work",
    });
  });

  it.each([
    "mailto:hi@example.com",
    "tel:+15555555555",
    "sms:+15555555555",
    "javascript:void(0)",
    "https://wa.me/15555555555",
    "https://api.whatsapp.com/send?phone=1",
    "https://chat.whatsapp.com/abc",
  ])("skips %s", (href) => {
    expect(check(href)).toBeNull();
  });

  it.each([
    "/resume",
    "/resume/",
    "/resume/print",
    "/cv.pdf",
    "/files/Resume.PDF",
    "/work.md",
    "https://example.com/paper.pdf?dl=1",
    "https://example.com/archive.zip",
    "https://drive.google.com/file/d/abc/view",
    "https://docs.google.com/document/d/abc/export",
  ])("skips the file or print link %s", (href) => {
    expect(check(href)).toBeNull();
  });

  it("keeps pages whose path merely starts like a quiet one", () => {
    expect(check("/resumes")).toEqual({ external: false, key: "/resumes" });
    expect(check("https://drive.google.com/drive/folders/x")).toMatchObject({
      external: true,
    });
  });

  it("returns null for an unparseable href", () => {
    expect(check("http://[bad")).toBeNull();
  });
});
