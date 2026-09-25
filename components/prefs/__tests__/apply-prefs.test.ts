// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  accentPresets,
  defaultPrefs,
  PREFS_KEY,
  type Prefs,
} from "@/lib/prefs";

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
    radius: root.style.getPropertyValue("--radius"),
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
      radius: 10,
      texture: "grid",
      motion: true,
      smoothScroll: false,
      cursor: false,
      sound: true,
    });

    expect(state()).toEqual({
      theme: "dark",
      accent: "jade",
      accentHue: "160",
      font: "serif",
      texture: "grid",
      motion: "on",
      smoothScroll: "off",
      cursor: "off",
      sound: "on",
      radius: "10px",
    });
  });

  it("writes kebab-case data attributes", () => {
    apply({ smoothScroll: false });
    expect(root.getAttribute("data-smooth-scroll")).toBe("off");
  });

  it("maps the defaults", () => {
    apply();
    expect(state()).toEqual({
      theme: "light",
      accent: "ember",
      accentHue: "38",
      font: "sans",
      texture: "noise",
      motion: "on",
      smoothScroll: "on",
      cursor: "on",
      sound: "off",
      radius: "6px",
    });
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

  describe("radius", () => {
    it.each([
      [-4, "0px"],
      [0, "0px"],
      [16, "16px"],
      [40, "16px"],
    ])("clamps %s to %s", (input, expected) => {
      apply({ radius: input });
      expect(root.style.getPropertyValue("--radius")).toBe(expected);
    });
  });

  describe("malformed values from storage", () => {
    it("skips non-numeric hue and radius instead of writing NaN", () => {
      root.style.setProperty("--accent-hue", "210");
      root.style.setProperty("--radius", "4px");

      expect(() => apply({ accentHue: "teal", radius: "big" })).not.toThrow();

      expect(root.style.getPropertyValue("--accent-hue")).toBe("210");
      expect(root.style.getPropertyValue("--radius")).toBe("4px");
    });

    it("treats only an explicit false as off and only an explicit true as sound on", () => {
      apply({
        motion: "no",
        smoothScroll: 0,
        cursor: null,
        sound: "yes",
      });
      expect(root.dataset.motion).toBe("on");
      expect(root.dataset.smoothScroll).toBe("on");
      expect(root.dataset.cursor).toBe("on");
      expect(root.dataset.sound).toBe("off");
    });

    it("accepts numeric strings for hue and radius", () => {
      apply({ accentHue: "275", radius: "8" });
      expect(root.dataset.accent).toBe("iris");
      expect(root.style.getPropertyValue("--radius")).toBe("8px");
    });
  });
});

describe("PrefsScript", () => {
  function extractScript(): string {
    const html = renderToStaticMarkup(createElement(PrefsScript));
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
      texture: "noise",
      motion: "on",
      smoothScroll: "on",
      cursor: "on",
      sound: "off",
      radius: "6px",
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
      texture: "noise",
      radius: "6px",
    });
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
      radius: "6px",
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
      radius: "6px",
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
