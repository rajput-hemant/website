// @vitest-environment jsdom
import * as React from "react";
import {
  accentPresets,
  defaultPrefs,
  PREFS_KEY,
  textures,
  type Prefs,
} from "@/flavors/minimal/lib/prefs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyPrefs } from "../apply-prefs";
import { PrefsScript } from "../prefs-script";

const DARK = "(prefers-color-scheme: dark)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const INTRO_KEY = "hr.intro";

const root = document.documentElement;

function mockMedia(...matching: string[]) {
  const matchMedia = vi.fn((query: string) => ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}

function apply(patch: Record<string, unknown> = {}) {
  applyPrefs({ ...defaultPrefs, ...patch } as Prefs, root, accentPresets);
}

function clearRoot() {
  for (const name of root.getAttributeNames()) root.removeAttribute(name);
}

function state() {
  return {
    ...root.dataset,
    accentHue: root.style.getPropertyValue("--accent-hue"),
  };
}

beforeEach(() => {
  clearRoot();
  window.localStorage.clear();
  window.sessionStorage.clear();
  mockMedia();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("applyPrefs", () => {
  it("maps every preference onto <html> as documented in lib/prefs.ts", () => {
    apply({
      theme: "dark",
      accentHue: accentPresets.jade,
      font: "serif",
      texture: "grid",
      motion: true,
      smoothScroll: true,
      cursor: true,
      sound: true,
      linkPreviews: false,
    });

    expect(state()).toEqual({
      theme: "dark",
      accent: "jade",
      accentHue: "160",
      font: "serif",
      texture: "grid",
      motion: "on",
      smoothScroll: "on",
      cursor: "on",
      sound: "on",
      linkPreviews: "off",
    });
  });

  it("writes kebab-case data attributes", () => {
    apply({ smoothScroll: true, linkPreviews: false });
    expect(root.getAttribute("data-smooth-scroll")).toBe("on");
    expect(root.getAttribute("data-link-previews")).toBe("off");
  });

  it("maps the calm defaults: effects off, link previews on", () => {
    apply();
    expect(state()).toEqual({
      theme: "light",
      accent: "ember",
      accentHue: "38",
      font: "sans",
      texture: "none",
      motion: "on",
      smoothScroll: "off",
      cursor: "off",
      sound: "off",
      linkPreviews: "on",
    });
  });

  it("never writes a radius: corners are a fixed token", () => {
    apply({ radius: 12 });
    expect(root.style.getPropertyValue("--radius")).toBe("");
  });

  describe("theme", () => {
    it("resolves system to dark when the OS prefers dark", () => {
      mockMedia(DARK);
      apply({ theme: "system" });
      expect(root.dataset.theme).toBe("dark");
    });

    it("resolves system to light otherwise", () => {
      const matchMedia = mockMedia();
      apply({ theme: "system" });
      expect(root.dataset.theme).toBe("light");
      expect(matchMedia).toHaveBeenCalledWith(DARK);
    });

    it("keeps an explicit light theme when the OS prefers dark", () => {
      mockMedia(DARK);
      apply({ theme: "light" });
      expect(root.dataset.theme).toBe("light");
    });

    it("keeps an explicit dark theme when the OS prefers light", () => {
      apply({ theme: "dark" });
      expect(root.dataset.theme).toBe("dark");
    });
  });

  describe("motion", () => {
    it("is forced off when the OS asks for reduced motion", () => {
      mockMedia(REDUCED_MOTION);
      apply({ motion: true });
      expect(root.dataset.motion).toBe("off");
    });

    it("is off when the visitor turns it off", () => {
      apply({ motion: false });
      expect(root.dataset.motion).toBe("off");
    });

    it("does not force smooth scrolling off under reduced motion", () => {
      mockMedia(REDUCED_MOTION);
      apply({ smoothScroll: true });
      expect(root.dataset.smoothScroll).toBe("on");
    });
  });

  describe("accent", () => {
    it("names each preset hue", () => {
      for (const [name, hue] of Object.entries(accentPresets)) {
        apply({ accentHue: hue });
        expect(root.dataset.accent).toBe(name);
      }
    });

    it("marks other hues as custom", () => {
      apply({ accentHue: 100 });
      expect(root.dataset.accent).toBe("custom");
      expect(root.style.getPropertyValue("--accent-hue")).toBe("100");
    });

    it.each([
      [398, "38", "ember"],
      [-30, "330", "orchid"],
      [360, "0", "custom"],
      [74.6, "75", "saffron"],
    ])("normalises hue %s to %s", (input, expected, accent) => {
      apply({ accentHue: input });
      expect(root.style.getPropertyValue("--accent-hue")).toBe(expected);
      expect(root.dataset.accent).toBe(accent);
    });
  });

  describe("malformed values from storage", () => {
    it("skips a non-numeric hue instead of writing NaN", () => {
      root.style.setProperty("--accent-hue", "210");
      expect(() => apply({ accentHue: "teal" })).not.toThrow();
      expect(root.style.getPropertyValue("--accent-hue")).toBe("210");
    });

    it("keeps each default unless the value is an explicit boolean", () => {
      apply({
        motion: "no",
        linkPreviews: 0,
        smoothScroll: 1,
        cursor: "true",
        sound: "yes",
      });
      expect(root.dataset.motion).toBe("on");
      expect(root.dataset.linkPreviews).toBe("on");
      expect(root.dataset.smoothScroll).toBe("off");
      expect(root.dataset.cursor).toBe("off");
      expect(root.dataset.sound).toBe("off");
    });

    it("accepts a numeric string for the hue", () => {
      apply({ accentHue: "275" });
      expect(root.dataset.accent).toBe("iris");
    });
  });
});

describe("PrefsScript", () => {
  function extractScript(): string {
    const html = renderToStaticMarkup(React.createElement(PrefsScript));
    const match = /^<script>([\s\S]*)<\/script>$/.exec(html);
    if (!match?.[1]) throw new Error(`Unexpected markup: ${html}`);
    return match[1];
  }

  function runScript() {
    new Function(extractScript())();
  }

  it("renders a single inline script", () => {
    const script = extractScript();
    expect(script).toContain(JSON.stringify(PREFS_KEY));
    expect(script).not.toContain("</script");
  });

  it("applies the defaults when nothing is stored", () => {
    mockMedia(DARK);
    expect(runScript).not.toThrow();
    expect(state()).toEqual({
      theme: "dark",
      accent: "ember",
      accentHue: "38",
      font: "sans",
      texture: "none",
      motion: "on",
      smoothScroll: "off",
      cursor: "off",
      sound: "off",
      linkPreviews: "on",
      intro: "play",
    });
  });

  it("applies stored preferences merged over the defaults", () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        theme: "dark",
        accentHue: accentPresets.lagoon,
        font: "mono",
        motion: false,
      })
    );

    expect(runScript).not.toThrow();

    expect(state()).toMatchObject({
      theme: "dark",
      accent: "lagoon",
      accentHue: "210",
      font: "mono",
      motion: "off",
      texture: "none",
    });
  });

  it("migrates version 1 preferences to the calm effect defaults", () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        theme: "dark",
        accentHue: accentPresets.iris,
        font: "serif",
        radius: 12,
        texture: "noise",
        motion: true,
        smoothScroll: true,
        cursor: true,
        sound: true,
      })
    );

    runScript();

    expect(state()).toEqual({
      theme: "dark",
      accent: "iris",
      accentHue: "275",
      font: "serif",
      texture: "none",
      motion: "on",
      smoothScroll: "off",
      cursor: "off",
      sound: "on",
      linkPreviews: "on",
      intro: "play",
    });
  });

  it("keeps effects chosen under the current version", () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ ...defaultPrefs, cursor: true, texture: "grid" })
    );
    runScript();
    expect(state()).toMatchObject({ cursor: "on", texture: "grid" });
  });

  it("applies every texture before first paint", () => {
    for (const texture of textures) {
      window.localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ ...defaultPrefs, texture })
      );
      runScript();
      expect(root.dataset.texture, texture).toBe(texture);
    }
  });

  it("drops an unknown texture instead of writing it to <html>", () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ ...defaultPrefs, texture: "plaid" })
    );
    runScript();
    expect(root.dataset.texture).toBe("none");
  });

  it("honours reduced motion", () => {
    mockMedia(REDUCED_MOTION);
    runScript();
    expect(root.dataset.motion).toBe("off");
  });

  it.each([
    ["invalid JSON", "{theme:"],
    ["null", "null"],
    ["an array", '["dark"]'],
    ["a string", '"dark"'],
    ["a number", "42"],
  ])("falls back to the defaults when storage holds %s", (_label, raw) => {
    window.localStorage.setItem(PREFS_KEY, raw);

    expect(runScript).not.toThrow();

    expect(state()).toMatchObject({
      theme: "light",
      accent: "ember",
      font: "sans",
      cursor: "off",
    });
    expect(root.dataset).not.toHaveProperty("0");
  });

  it("still applies the defaults when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });

    expect(runScript).not.toThrow();

    expect(state()).toMatchObject({
      theme: "light",
      accent: "ember",
      motion: "on",
    });
  });

  it("does not throw when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(runScript).not.toThrow();
  });

  it("flags the intro once per session", () => {
    runScript();
    expect(root.dataset.intro).toBe("play");
    expect(window.sessionStorage.getItem(INTRO_KEY)).toBe("1");

    clearRoot();
    runScript();
    expect(root.dataset.intro).toBeUndefined();
  });

  it("applies preferences even when sessionStorage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(runScript).not.toThrow();
    expect(root.dataset.theme).toBe("light");
  });
});
