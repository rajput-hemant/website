// @vitest-environment jsdom
import type * as React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { askMessages } from "@/lib/ask/response";

import { useMessageModeration } from "../use-message-moderation";
import { useOwnerSignIn } from "../use-owner-sign-in";
import { useThreadReply } from "../use-thread-reply";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  moderate: vi.fn(),
  setOwner: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("@/lib/ask/client", () => ({
  signIn: mocks.signIn,
  signOut: mocks.signOut,
  moderate: mocks.moderate,
}));
vi.mock("../owner-provider", () => ({
  useOwner: () => ({ ready: true, owner: true, setOwner: mocks.setOwner }),
}));

const submitEvent = {
  preventDefault: () => {},
} as unknown as React.FormEvent<HTMLFormElement>;

afterEach(() => {
  vi.clearAllMocks();
});

describe("useOwnerSignIn", () => {
  it("asks for a passphrase before calling the server", async () => {
    const { result } = renderHook(() => useOwnerSignIn());
    await act(() => result.current.handleSignIn(submitEvent));
    expect(result.current.error).toBe("Enter the passphrase.");
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("signs in and goes to Ask, or says the passphrase is wrong", async () => {
    const { result } = renderHook(() => useOwnerSignIn());
    const input = document.createElement("input");
    input.value = "secret";
    (result.current.inputRef as React.RefObject<HTMLInputElement>).current =
      input;

    mocks.signIn.mockResolvedValueOnce({ ok: true, owner: false });
    await act(() => result.current.handleSignIn(submitEvent));
    expect(result.current.error).toBe(askMessages.ownerWrong);

    mocks.signIn.mockResolvedValueOnce({ ok: true, owner: true });
    await act(() => result.current.handleSignIn(submitEvent));
    expect(mocks.signIn).toHaveBeenLastCalledWith("secret");
    expect(mocks.setOwner).toHaveBeenCalledWith(true);
    expect(mocks.push).toHaveBeenCalledWith("/ask");
    expect(result.current.error).toBeNull();
  });

  it("signs out", async () => {
    mocks.signOut.mockResolvedValue({ ok: true, owner: false });
    const { result } = renderHook(() => useOwnerSignIn());
    await act(() => result.current.handleSignOut());
    expect(mocks.setOwner).toHaveBeenCalledWith(false);
  });
});

describe("useMessageModeration", () => {
  it("hides a message and announces it", async () => {
    mocks.moderate.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useMessageModeration("a", "k1"));
    act(() => result.current.run("reject"));
    await waitFor(() => expect(result.current.result).toBe("Hidden"));
    expect(mocks.moderate).toHaveBeenCalledWith({
      slug: "a",
      target: "k1",
      action: "reject",
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("surfaces the server's error", async () => {
    mocks.moderate.mockResolvedValue({ ok: false, message: "Failed" });
    const { result } = renderHook(() => useMessageModeration("a", "thread"));
    act(() => result.current.run("spam"));
    await waitFor(() => expect(result.current.result).toBe("Failed"));
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});

describe("useThreadReply", () => {
  it("opens, then closes after a send with the edition's pending notice", () => {
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      cb();
      return 0;
    });
    const { result } = renderHook(() => useThreadReply(false, "Waiting."));
    expect(result.current.open).toBe(false);
    act(() => result.current.openComposer());
    expect(result.current.open).toBe(true);

    act(() => result.current.handleSent("pending"));
    expect(result.current.open).toBe(false);
    expect(result.current.announcement).toBe("Waiting.");

    act(() => result.current.openComposer());
    act(() => result.current.handleSent("published"));
    expect(result.current.announcement).toBe("Reply published.");
    vi.unstubAllGlobals();
  });

  it("stays open on the permalink page", () => {
    const { result } = renderHook(() => useThreadReply(true, "Waiting."));
    expect(result.current.collapsible).toBe(false);
    act(() => result.current.handleSent("pending"));
    expect(result.current.open).toBe(true);
    expect(result.current.announcement).toBe("");
  });
});
