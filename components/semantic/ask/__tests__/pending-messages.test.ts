// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  addPendingMessage,
  PENDING_KEY,
  usePendingReplies,
  usePendingThreads,
} from "../pending-messages";

const stored = () => JSON.parse(localStorage.getItem(PENDING_KEY) ?? "[]");
const now = () => new Date().toISOString();

afterEach(() => {
  localStorage.clear();
});

describe("pending messages", () => {
  it("prunes threads once they are published", () => {
    addPendingMessage({ slug: "a", body: "First", createdAt: now() });
    addPendingMessage({ slug: "b", body: "Second", createdAt: now() });

    const { result } = renderHook(() => usePendingThreads(["a"]));

    expect(result.current.map((entry) => entry.slug)).toEqual(["b"]);
    expect(stored().map((entry: { slug: string }) => entry.slug)).toEqual([
      "b",
    ]);
  });

  it("drops entries older than two weeks", () => {
    const old = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify([{ slug: "old", body: "Stale", createdAt: old }])
    );

    renderHook(() => usePendingThreads([]));

    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });

  it("keeps replies to their own thread", () => {
    addPendingMessage({ slug: "a", key: "r1", body: "Mine", createdAt: now() });
    addPendingMessage({
      slug: "b",
      key: "r2",
      body: "Other",
      createdAt: now(),
    });

    const { result } = renderHook(() => usePendingReplies("a", []));

    expect(result.current.map((entry) => entry.key)).toEqual(["r1"]);
  });

  it("updates when another tab writes", () => {
    const { result } = renderHook(() => usePendingThreads([]));
    expect(result.current).toEqual([]);

    act(() => {
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify([{ slug: "tab", body: "Elsewhere", createdAt: now() }])
      );
      window.dispatchEvent(new StorageEvent("storage", { key: PENDING_KEY }));
    });

    expect(result.current.map((entry) => entry.slug)).toEqual(["tab"]);
  });
});
