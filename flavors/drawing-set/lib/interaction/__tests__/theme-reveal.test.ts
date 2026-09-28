// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setPrefs = vi.fn();
vi.mock("@/flavors/drawing-set/lib/prefs-store", () => ({ setPrefs }));

const { revealTheme } = await import("../theme-reveal");

const root = document.documentElement;

function mockDarkScheme(dark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: dark, media: query }))
  );
}

beforeEach(() => {
  setPrefs.mockClear();
  root.dataset.theme = "light";
  root.dataset.motion = "on";
  mockDarkScheme(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "startViewTransition");
  delete root.dataset.themeExposure;
});

function stubViewTransitions() {
  const animate = vi.fn();
  root.animate = animate;
  const start = vi.fn((update: () => void) => {
    update();
    return {
      ready: Promise.resolve(),
      finished: Promise.resolve(),
    };
  });
  Object.defineProperty(document, "startViewTransition", {
    value: start,
    configurable: true,
  });
  return { start, animate };
}

describe("revealTheme", () => {
  it("switches instantly without View Transitions support", () => {
    revealTheme("dark");
    expect(setPrefs).toHaveBeenCalledExactlyOnceWith({ theme: "dark" });
  });

  it("switches instantly when motion is off", () => {
    const { start } = stubViewTransitions();
    root.dataset.motion = "off";
    revealTheme("dark");
    expect(start).not.toHaveBeenCalled();
    expect(setPrefs).toHaveBeenCalledWith({ theme: "dark" });
  });

  it("crossfades inside a view transition when the theme changes", async () => {
    const { start, animate } = stubViewTransitions();
    revealTheme("dark");

    expect(start).toHaveBeenCalledOnce();
    expect(setPrefs).toHaveBeenCalledWith({ theme: "dark" });
    expect(root.dataset.themeExposure).toBe("");

    await Promise.resolve();
    expect(animate).toHaveBeenCalledTimes(2);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.dataset.themeExposure).toBeUndefined();
  });
});
