// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";

import { preventSmoothScroll } from "../scroll";

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("style");
  document.body.removeAttribute("style");
});

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const target = document.querySelector<HTMLElement>("#target");
  if (!target) throw new Error("no #target");
  return target;
}

describe("preventSmoothScroll", () => {
  it("leaves modal dialogs and marked subtrees to native scroll", () => {
    for (const html of [
      '<div id="target" role="dialog" aria-modal="true"></div>',
      '<div id="target" role="alertdialog"></div>',
      '<div id="target" data-lenis-prevent></div>',
    ]) {
      expect(preventSmoothScroll(mount(html))).toBe(true);
    }
  });

  it("keeps smooth scrolling over a non-modal popover", () => {
    for (const html of [
      '<div id="target" role="dialog"></div>',
      '<div id="target" role="listbox"></div>',
    ]) {
      expect(preventSmoothScroll(mount(html))).toBe(false);
    }
  });

  it("smooths ordinary page content", () => {
    const target = mount('<main id="target"></main>');
    expect(preventSmoothScroll(target)).toBe(false);
    expect(preventSmoothScroll(document.body)).toBe(false);
  });

  it("hands every wheel back to the browser while a modal locks the page", () => {
    mount('<div id="target"></div>');
    document.documentElement.style.overflowY = "hidden";
    expect(preventSmoothScroll(document.body)).toBe(true);

    document.documentElement.style.overflowY = "";
    document.body.style.overflowY = "clip";
    expect(preventSmoothScroll(document.body)).toBe(true);
  });
});
