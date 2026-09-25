// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { textures } from "@/lib/prefs";

import {
  hasSpotlight,
  isBackgroundClick,
  textureIsLive,
  type TextureGate,
} from "../texture-rules";

const live: TextureGate = {
  texture: "grid",
  finePointer: true,
  motion: true,
  reducedMotion: false,
};

describe("textureIsLive", () => {
  it("loads for every texture on a fine pointer with motion allowed", () => {
    for (const texture of textures.filter((name) => name !== "none")) {
      expect(textureIsLive({ ...live, texture }), texture).toBe(true);
    }
  });

  it.each([
    ["no texture (the default)", { texture: "none" }],
    ["a touch screen", { finePointer: false }],
    ["the motion switch off", { motion: false }],
    ["OS reduced motion", { reducedMotion: true }],
  ] as const)("stays static with %s", (_label, patch) => {
    expect(textureIsLive({ ...live, ...patch })).toBe(false);
  });
});

describe("hasSpotlight", () => {
  it("lights grid and dots only", () => {
    expect(textures.filter(hasSpotlight)).toEqual(["grid", "dots"]);
  });
});

describe("isBackgroundClick", () => {
  document.body.innerHTML = `
    <main id="main">
      <section id="section">
        <div id="column">
          <p id="text">Hello <a id="link" href="/x"><span id="inner">x</span></a></p>
          <button id="button">Go</button>
          <div role="dialog" id="dialog"><div id="in-dialog"></div></div>
          <img id="image" alt="" />
          <div data-customize><div id="panel"></div></div>
        </div>
      </section>
    </main>`;
  const at = (id: string) => document.getElementById(id);

  it("accepts the page and layout boxes around content", () => {
    for (const target of [
      document.body,
      at("main"),
      at("section"),
      at("column"),
    ]) {
      expect(isBackgroundClick(target), target?.id || "body").toBe(true);
    }
  });

  it("rejects text, links, controls, media and panels", () => {
    for (const id of [
      "text",
      "link",
      "inner",
      "button",
      "in-dialog",
      "image",
      "panel",
    ]) {
      expect(isBackgroundClick(at(id)), id).toBe(false);
    }
  });

  it("rejects non-elements", () => {
    expect(isBackgroundClick(null)).toBe(false);
    expect(isBackgroundClick(window)).toBe(false);
  });
});
