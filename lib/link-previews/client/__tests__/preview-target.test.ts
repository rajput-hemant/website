// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { previewTarget } from "@/lib/link-previews/client/preview-target";

function setup(html: string) {
  document.body.innerHTML = `<header data-site-header><nav><a id="nav" href="/lab">Lab</a></nav></header>
    <main id="content">${html}</main>
    <footer><a id="foot" href="https://github.com/x">GitHub</a></footer>`;
  return document.getElementById("content");
}

const at = (id: string) => document.getElementById(id);

function expectNone(main: Element | null, ids: string[]) {
  for (const id of ids) expect(previewTarget(at(id), main), id).toBeNull();
}

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

  it("skips chrome, the contact row and opt-outs", () => {
    const main = setup(`
      <header><a id="page-header" href="/now">Now</a></header>
      <ul data-contact><li><a id="contact-gh" href="https://github.com/x">GitHub</a></li></ul>
      <div data-no-preview><a id="opted" href="/now">Now</a></div>
      <a id="self-opted" data-no-preview href="/now">Now</a>`);
    expectNone(main, [
      "nav",
      "foot",
      "page-header",
      "contact-gh",
      "opted",
      "self-opted",
    ]);
  });

  it("skips destinations that don't earn a card", () => {
    const main = setup(`
      <a id="home" href="/">Home</a>
      <a id="origin" href="${window.location.origin}/">Home</a>
      <a id="anchor" href="#zunta">Zunta</a>
      <a id="self" href="/work#zunta">Zunta</a>
      <a id="mail" href="mailto:a@b.c">mail</a>
      <a id="tel" href="tel:+1555">call</a>
      <a id="wa" href="https://wa.me/1555">WhatsApp</a>
      <a id="pdf" href="/cv.pdf">CV</a>
      <a id="download" href="/files/cv" download>CV</a>
      <a id="resume" href="/resume">Printable resume</a>
      <span id="plain">text</span>`);
    expectNone(main, [
      "home",
      "origin",
      "anchor",
      "self",
      "mail",
      "tel",
      "wa",
      "pdf",
      "download",
      "resume",
      "plain",
    ]);
  });

  it("lets data-preview override quiet regions but not destination rules", () => {
    const main = setup(`
      <ul data-contact>
        <li><a id="forced" data-preview href="https://github.com/x">GitHub</a></li>
        <li><a id="forced-mail" data-preview href="mailto:a@b.c">mail</a></li>
      </ul>
      <div data-preview><div data-no-preview><a id="nearest" href="/now">Now</a></div></div>`);
    expect(previewTarget(at("forced"), main)).toMatchObject({
      key: "https://github.com/x",
      external: true,
    });
    expectNone(main, ["forced-mail", "nearest"]);
  });

  it("ignores everything when there is no main", () => {
    setup(`<a id="x" href="/lab">Lab</a>`);
    expect(previewTarget(at("x"), null)).toBeNull();
  });
});
