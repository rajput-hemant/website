// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setPrefs = vi.fn();
const playVoice = vi.fn();
vi.mock("@/flavors/press/lib/prefs-store", () => ({ setPrefs }));
vi.mock("@/lib/sound", () => ({
  isSoundOn: () => document.documentElement.dataset.sound === "on",
  playVoice,
}));

const { swapPlates } = await import("../plate-swap");

const root = document.documentElement;

beforeEach(() => {
  setPrefs.mockClear();
  playVoice.mockClear();
  root.dataset.theme = "light";
  root.dataset.sound = "on";
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: false, media: query }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "startViewTransition");
  delete root.dataset.plateSwap;
});

function stubViewTransitions() {
  let ready: () => void = () => {};
  const start = vi.fn((update: () => void) => {
    update();
    return {
      ready: new Promise<void>((resolve) => (ready = resolve)),
      finished: Promise.resolve(),
    };
  });
  Object.defineProperty(document, "startViewTransition", {
    value: start,
    configurable: true,
  });
  return { start, ready: () => ready() };
}

describe("swapPlates", () => {
  it("switches and sounds at once without View Transitions", () => {
    swapPlates("dark", { voice: true });
    expect(setPrefs).toHaveBeenCalledExactlyOnceWith({ theme: "dark" });
    expect(playVoice).toHaveBeenCalledOnce();
  });

  it("sounds the plate when the wipe starts, not before", async () => {
    const { start, ready } = stubViewTransitions();
    swapPlates("dark", { voice: true });
    expect(start).toHaveBeenCalledOnce();
    expect(root.dataset.plateSwap).toBe("");
    expect(playVoice).not.toHaveBeenCalled();
    ready();
    await Promise.resolve();
    expect(playVoice).toHaveBeenCalledOnce();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.dataset.plateSwap).toBeUndefined();
  });

  it("neither wipes nor sounds when the theme on screen stays", () => {
    const { start } = stubViewTransitions();
    swapPlates("system", { voice: true });
    expect(start).not.toHaveBeenCalled();
    expect(playVoice).not.toHaveBeenCalled();
    expect(setPrefs).toHaveBeenCalledWith({ theme: "system" });
  });

  it("stays silent without a voice or with sound off", () => {
    swapPlates("dark");
    root.dataset.sound = "off";
    swapPlates("dark", { voice: true });
    expect(playVoice).not.toHaveBeenCalled();
  });
});
