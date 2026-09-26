// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { resolveCursorTarget } from "../cursor-state";

function render(html: string) {
  document.body.innerHTML = html;
}

const stateOf = (id: string, pathname = "/") =>
  resolveCursorTarget(document.getElementById(id), pathname).state;

describe("resolveCursorTarget", () => {
  it("maps elements to ring states", () => {
    render(`
      <a id="internal" href="/work"><span id="child">Work</span></a>
      <a id="external" href="https://example.com">Out</a>
      <a id="blank" href="/cv.pdf" target="_blank">CV</a>
      <button id="button">Go</button>
      <button id="disabled" disabled><span id="disabled-child">No</span></button>
      <div role="button" aria-disabled="true" id="aria-disabled">No</div>
      <input id="text" type="email">
      <input id="checkbox" type="checkbox">
      <textarea id="area"></textarea>
      <button id="copy" data-cursor="copy">Copy</button>
      <p id="prose">Just text</p>
      <canvas id="canvas"></canvas>
      <iframe id="frame"></iframe>`);

    expect(stateOf("child")).toBe("link");
    expect(stateOf("external")).toBe("external");
    expect(stateOf("blank")).toBe("external");
    expect(stateOf("button")).toBe("link");
    expect(stateOf("disabled-child")).toBe("disabled");
    expect(stateOf("aria-disabled")).toBe("disabled");
    expect(stateOf("text")).toBe("text");
    expect(stateOf("checkbox")).toBe("link");
    expect(stateOf("area")).toBe("text");
    expect(stateOf("copy")).toBe("copy");
    expect(stateOf("prose")).toBe("default");
    expect(stateOf("frame")).toBe("hidden");
    expect(stateOf("canvas", "/")).toBe("default");
    expect(stateOf("canvas", "/lab/signature-field")).toBe("drag");
    expect(resolveCursorTarget(null, "/").state).toBe("default");
  });

  it("ignores the preference attribute on <html>", () => {
    document.documentElement.dataset.cursor = "on";
    render(`<p id="prose">text</p>`);
    expect(stateOf("prose")).toBe("default");
  });

  it("offers small controls and nav links as magnets", () => {
    render(`<nav><a id="nav" href="/lab">Lab</a></nav><p id="prose">x</p>`);
    const nav = document.getElementById("nav");
    expect(resolveCursorTarget(nav, "/").magnet).toBe(nav);
    expect(
      resolveCursorTarget(document.getElementById("prose"), "/").magnet
    ).toBeNull();
  });
});
