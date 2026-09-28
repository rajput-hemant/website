// @vitest-environment jsdom
import * as React from "react";
import {
  defaultPrefs,
  PREFS_KEY,
  type Prefs,
} from "@/flavors/minimal/lib/prefs";
import type * as PrefsStoreModule from "@/flavors/minimal/lib/prefs-store";
import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type PrefsStore = typeof PrefsStoreModule;

async function loadStore(): Promise<PrefsStore> {
  vi.resetModules();
  return import("@/flavors/minimal/lib/prefs-store");
}

function stored(): unknown {
  const raw = window.localStorage.getItem(PREFS_KEY);
  return raw === null ? null : JSON.parse(raw);
}

function dispatchStorage(key: string | null) {
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePrefs", () => {
  it("returns the defaults when storage is empty", async () => {
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual(defaultPrefs);
  });

  it("returns the defaults when storage holds invalid JSON", async () => {
    window.localStorage.setItem(PREFS_KEY, "{not json");
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual(defaultPrefs);
  });

  it("returns the defaults when storage holds JSON null", async () => {
    window.localStorage.setItem(PREFS_KEY, "null");
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual(defaultPrefs);
  });

  it("merges stored values over the defaults", async () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ theme: "dark", accentHue: 210 })
    );
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual({
      ...defaultPrefs,
      theme: "dark",
      accentHue: 210,
    });
  });

  it("migrates stored version 1 preferences on read", async () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ theme: "dark", radius: 12, cursor: true, sound: true })
    );
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual({
      ...defaultPrefs,
      theme: "dark",
      sound: true,
    });
    expect(result.current).not.toHaveProperty("radius");
  });

  it("returns a stable snapshot between renders", async () => {
    const { usePrefs } = await loadStore();
    const { result, rerender } = renderHook(() => usePrefs());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("returns the defaults when server rendering, whatever is stored", async () => {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: "dark" }));
    const { usePrefs } = await loadStore();
    let seen: Prefs | undefined;
    function Probe() {
      seen = usePrefs();
      return null;
    }
    renderToString(React.createElement(Probe));
    expect(seen).toEqual(defaultPrefs);
  });

  it("re-renders with the new value after setPrefs", async () => {
    const { usePrefs, setPrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    act(() => setPrefs({ font: "mono" }));
    expect(result.current.font).toBe("mono");
  });
});

describe("setPrefs", () => {
  it("persists the merged preferences under PREFS_KEY", async () => {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: "dark" }));
    const { setPrefs } = await loadStore();
    setPrefs({ sound: true });
    expect(stored()).toEqual({ ...defaultPrefs, theme: "dark", sound: true });
  });

  it("accumulates successive patches", async () => {
    const { setPrefs } = await loadStore();
    setPrefs({ theme: "light" });
    setPrefs({ accentHue: 210 });
    expect(stored()).toEqual({
      ...defaultPrefs,
      theme: "light",
      accentHue: 210,
    });
  });
});

describe("resetPrefs", () => {
  it("writes the defaults back to storage and notifies subscribers", async () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ theme: "dark", motion: false })
    );
    const { resetPrefs, subscribePrefs } = await loadStore();
    const listener = vi.fn();
    subscribePrefs(listener);

    resetPrefs();

    expect(stored()).toEqual(defaultPrefs);
    expect(listener).toHaveBeenCalledExactlyOnceWith(defaultPrefs);
  });
});

describe("subscribePrefs", () => {
  it("calls listeners with the latest preferences on every write", async () => {
    const { setPrefs, subscribePrefs } = await loadStore();
    const listener = vi.fn();
    subscribePrefs(listener);

    setPrefs({ texture: "grid" });
    setPrefs({ cursor: true });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({
      ...defaultPrefs,
      texture: "grid",
      cursor: true,
    });
  });

  it("stops calling a listener after it unsubscribes", async () => {
    const { setPrefs, subscribePrefs } = await loadStore();
    const listener = vi.fn();
    const unsubscribe = subscribePrefs(listener);

    unsubscribe();
    setPrefs({ theme: "dark" });

    expect(listener).not.toHaveBeenCalled();
  });

  it("re-reads storage when another tab changes PREFS_KEY", async () => {
    const { subscribePrefs } = await loadStore();
    const listener = vi.fn();
    subscribePrefs(listener);

    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: "dark" }));
    dispatchStorage(PREFS_KEY);

    expect(listener).toHaveBeenCalledExactlyOnceWith({
      ...defaultPrefs,
      theme: "dark",
    });
  });

  it("ignores storage events for other keys", async () => {
    const { subscribePrefs } = await loadStore();
    const listener = vi.fn();
    subscribePrefs(listener);

    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: "dark" }));
    dispatchStorage("something-else");

    expect(listener).not.toHaveBeenCalled();
  });

  it("removes its storage listener on unsubscribe", async () => {
    const { subscribePrefs } = await loadStore();
    const listener = vi.fn();
    subscribePrefs(listener)();

    dispatchStorage(PREFS_KEY);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("cross-tab sync", () => {
  it("updates the hook's snapshot from a storage event", async () => {
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current.theme).toBe("system");

    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ theme: "light", font: "serif" })
    );
    act(() => dispatchStorage(PREFS_KEY));

    expect(result.current).toEqual({
      ...defaultPrefs,
      theme: "light",
      font: "serif",
    });
  });
});

describe("unavailable storage", () => {
  it("falls back to the defaults when reading throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual(defaultPrefs);
  });

  it("keeps preferences in memory and notifies when writing throws", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const { usePrefs, setPrefs, subscribePrefs } = await loadStore();
    const listener = vi.fn();
    subscribePrefs(listener);
    const { result } = renderHook(() => usePrefs());

    expect(() => act(() => setPrefs({ theme: "dark" }))).not.toThrow();

    expect(result.current.theme).toBe("dark");
    expect(listener).toHaveBeenCalledWith({ ...defaultPrefs, theme: "dark" });
  });
});
