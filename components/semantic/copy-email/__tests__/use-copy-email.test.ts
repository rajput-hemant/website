// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCopyEmail } from "../use-copy-email";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useCopyEmail", () => {
  it("copies, then resets after the delay", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const { result } = renderHook(() => useCopyEmail("a@b.dev", 1000));

    let ok = false;
    await act(async () => {
      ok = await result.current.copy();
    });
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("a@b.dev");
    expect(result.current.copied).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.copied).toBe(false);
  });

  it("reports failure when the clipboard is refused", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("no")) },
    });
    const { result } = renderHook(() => useCopyEmail("a@b.dev", 1000));
    let ok = true;
    await act(async () => {
      ok = await result.current.copy();
    });
    expect(ok).toBe(false);
    expect(result.current.copied).toBe(false);
  });

  it("clears its timer on unmount", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { result, unmount } = renderHook(() => useCopyEmail("a@b.dev", 1000));
    await act(async () => {
      await result.current.copy();
    });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
