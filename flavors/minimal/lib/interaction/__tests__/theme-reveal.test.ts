// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setPrefs = vi.fn();
vi.mock("@/flavors/minimal/lib/prefs-store", () => ({ setPrefs }));

const { originOf, revealTheme } = await import("../theme-reveal");

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
  delete root.dataset.themeReveal;
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
    revealTheme("dark", { x: 10, y: 10 });
    expect(setPrefs).toHaveBeenCalledExactlyOnceWith({ theme: "dark" });
  });

  it("switches instantly when motion is off", () => {
    const { start } = stubViewTransitions();
    root.dataset.motion = "off";
    revealTheme("dark", { x: 10, y: 10 });
    expect(start).not.toHaveBeenCalled();
    expect(setPrefs).toHaveBeenCalledWith({ theme: "dark" });
  });

  it("skips the animation when the resolved theme doesn't change", () => {
    const { start } = stubViewTransitions();
    revealTheme("system", { x: 10, y: 10 });
    expect(start).not.toHaveBeenCalled();
    expect(setPrefs).toHaveBeenCalledWith({ theme: "system" });
  });

  it("grows a circle from the origin inside a view transition", async () => {
    const { start, animate } = stubViewTransitions();
    revealTheme("dark", { x: 100, y: 20 });

    expect(start).toHaveBeenCalledOnce();
    expect(setPrefs).toHaveBeenCalledWith({ theme: "dark" });
    expect(root.dataset.themeReveal).toBe("");

    await Promise.resolve();
    await Promise.resolve();
    expect(animate).toHaveBeenCalledOnce();
    const [keyframes, options] = animate.mock.calls[0] as [
      { clipPath: string[] },
      KeyframeAnimationOptions,
    ];
    expect(keyframes.clipPath[0]).toBe("circle(0px at 100px 20px)");
    expect(options).toMatchObject({
      duration: 400,
      pseudoElement: "::view-transition-new(root)",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.dataset.themeReveal).toBeUndefined();
  });
});

describe("originOf", () => {
  it("uses the pointer position, or the control's centre for keyboard clicks", () => {
    const button = document.createElement("button");
    button.getBoundingClientRect = () =>
      ({ left: 10, top: 20, width: 30, height: 40 }) as DOMRect;

    expect(
      originOf({ clientX: 5, clientY: 6, detail: 1, currentTarget: button })
    ).toEqual({ x: 5, y: 6 });
    expect(
      originOf({ clientX: 0, clientY: 0, detail: 0, currentTarget: button })
    ).toEqual({ x: 25, y: 40 });
  });
});
