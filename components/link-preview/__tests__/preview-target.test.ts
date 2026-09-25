// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { previewTarget } from "../preview-target";

function setup(html: string) {
  document.body.innerHTML = `<header><nav><a id="nav" href="/lab">Lab</a></nav></header>
    <main id="content">${html}</main>
    <footer><a id="foot" href="https://github.com/x">GitHub</a></footer>`;
  return document.getElementById("content");
}

const at = (id: string) => document.getElementById(id);

describe("previewTarget", () => {
  beforeEach(() => window.history.pushState({}, "", "/work"));

  it("keys internal links by path and external links by normalised URL", () => {
    const main = setup(`
      <a id="lab" href="/lab/"><span id="inner">Lab</span></a>
      <a id="gh" href="https://github.com/a/b#readme">repo</a>`);
    expect(previewTarget(at("inner"), main)).toMatchObject({
      key: "/lab",
      external: false,
    });
    expect(previewTarget(at("gh"), main)).toMatchObject({
      key: "https://github.com/a/b",
      external: true,
    });
  });

  it("skips chrome, opt-outs, the current page and non-http links", () => {
    const main = setup(`
      <header><a id="page-header" href="/now">Now</a></header>
      <div data-no-preview><a id="opted" href="/now">Now</a></div>
      <a id="self" href="/work#zunta">Zunta</a>
      <a id="mail" href="mailto:a@b.c">mail</a>
      <a id="file" href="/resume.pdf" download>pdf</a>
      <span id="plain">text</span>`);
    for (const id of [
      "nav",
      "foot",
      "page-header",
      "opted",
      "self",
      "mail",
      "file",
      "plain",
    ]) {
      expect(previewTarget(at(id), main), id).toBeNull();
    }
  });

  it("ignores everything when there is no main", () => {
    setup(`<a id="x" href="/lab">Lab</a>`);
    expect(previewTarget(at("x"), null)).toBeNull();
  });
});
