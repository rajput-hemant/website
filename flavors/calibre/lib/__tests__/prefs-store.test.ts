// @vitest-environment jsdom
import * as React from "react";
import {
  defaultPrefs,
  PREFS_KEY,
  type Prefs,
} from "@/flavors/calibre/lib/prefs";
import type * as PrefsStoreModule from "@/flavors/calibre/lib/prefs-store";
import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type PrefsStore = typeof PrefsStoreModule;

async function loadStore(): Promise<PrefsStore> {
  vi.resetModules();
  return import("@/flavors/calibre/lib/prefs-store");
}

const stored = (): unknown => {
  const raw = window.localStorage.getItem(PREFS_KEY);
  return raw === null ? null : JSON.parse(raw);
};

const current = (patch: Partial<Prefs>) => ({ ...defaultPrefs, ...patch });

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("calibre prefs store", () => {
  it("returns the defaults when storage is empty or broken", async () => {
    window.localStorage.setItem(PREFS_KEY, "{not json");
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual(defaultPrefs);
  });

  it("reads stored choices of the current version", async () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify(current({ theme: "light", sound: true }))
    );
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual(current({ theme: "light", sound: true }));
  });

  it("keeps only the theme from an older version", async () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ version: 0, theme: "dark", motion: false })
    );
    const { usePrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(result.current).toEqual(current({ theme: "dark" }));
  });

  it("returns the defaults when server rendering, whatever is stored", async () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify(current({ theme: "light" }))
    );
    const { usePrefs } = await loadStore();
    let seen: Prefs | undefined;
    function Probe() {
      seen = usePrefs();
      return null;
    }
    renderToString(React.createElement(Probe));
    expect(seen).toEqual(defaultPrefs);
  });

  it("persists patches under its own key and notifies subscribers", async () => {
    const { setPrefs, subscribePrefs, usePrefs } = await loadStore();
    const listener = vi.fn();
    subscribePrefs(listener);
    const { result } = renderHook(() => usePrefs());

    act(() => setPrefs({ sound: true }));
    act(() => setPrefs({ scene: "low" }));

    expect(result.current).toEqual(current({ sound: true, scene: "low" }));
    expect(stored()).toEqual(current({ sound: true, scene: "low" }));
    expect(listener).toHaveBeenLastCalledWith(
      current({ sound: true, scene: "low" })
    );
  });

  it("resets to the defaults", async () => {
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify(current({ motion: false }))
    );
    const { resetPrefs } = await loadStore();
    resetPrefs();
    expect(stored()).toEqual(defaultPrefs);
  });

  it("follows another tab writing its key, and ignores other keys", async () => {
    const { subscribePrefs } = await loadStore();
    const listener = vi.fn();
    subscribePrefs(listener);

    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify(current({ theme: "dark" }))
    );
    window.dispatchEvent(new StorageEvent("storage", { key: "hr.pp.prefs" }));
    expect(listener).not.toHaveBeenCalled();

    window.dispatchEvent(new StorageEvent("storage", { key: PREFS_KEY }));
    expect(listener).toHaveBeenCalledExactlyOnceWith(
      current({ theme: "dark" })
    );
  });

  it("keeps preferences in memory when storage is full", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const { usePrefs, setPrefs } = await loadStore();
    const { result } = renderHook(() => usePrefs());
    expect(() => act(() => setPrefs({ theme: "dark" }))).not.toThrow();
    expect(result.current.theme).toBe("dark");
  });
});
