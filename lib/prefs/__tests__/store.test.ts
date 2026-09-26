// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { createPrefsStore } from "../store";

type P = { theme: string; motion: boolean };
const defaults: P = { theme: "system", motion: true };
const migrate = (stored: unknown): P => ({ ...defaults, ...(stored as P) });

beforeEach(() => {
  window.localStorage.clear();
});

describe("createPrefsStore", () => {
  it("keeps separate instances apart", () => {
    const a = createPrefsStore({ key: "test.a", defaults, migrate });
    const b = createPrefsStore({ key: "test.b", defaults, migrate });
    const { result: ra } = renderHook(() => a.usePrefs());
    const { result: rb } = renderHook(() => b.usePrefs());

    act(() => a.setPrefs({ theme: "dark" }));

    expect(ra.current.theme).toBe("dark");
    expect(rb.current.theme).toBe("system");
    expect(JSON.parse(window.localStorage.getItem("test.a")!)).toEqual({
      theme: "dark",
      motion: true,
    });
    expect(window.localStorage.getItem("test.b")).toBeNull();
  });

  it("follows another tab through storage events", () => {
    const store = createPrefsStore({ key: "test.c", defaults, migrate });
    const seen: P[] = [];
    const stop = store.subscribePrefs((prefs) => seen.push(prefs));

    window.localStorage.setItem("test.c", JSON.stringify({ motion: false }));
    window.dispatchEvent(new StorageEvent("storage", { key: "test.c" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    stop();

    expect(seen).toEqual([{ theme: "system", motion: false }]);
  });

  it("resets to the defaults", () => {
    const store = createPrefsStore({ key: "test.d", defaults, migrate });
    const { result } = renderHook(() => store.usePrefs());
    act(() => store.setPrefs({ motion: false }));
    act(() => store.resetPrefs());
    expect(result.current).toEqual(defaults);
  });
});
