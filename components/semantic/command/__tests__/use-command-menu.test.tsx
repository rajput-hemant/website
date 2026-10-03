// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { openCommandMenu, toggleCommandMenu } from "@/lib/command/events";
import { getCommandMenuOpen } from "@/lib/command/state";

import { useCommandMenu } from "../use-command-menu";

const keys = { p: "/projects", h: "/" } as const;
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function press(
  key: string,
  init: KeyboardEventInit = {},
  target: EventTarget = window
) {
  const code = /^[a-z]$/i.test(key)
    ? `Key${key.toUpperCase()}`
    : key === "/"
      ? "Slash"
      : key;
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        code,
        bubbles: true,
        cancelable: true,
        ...init,
      })
    );
  });
}

beforeEach(() => push.mockClear());
afterEach(cleanup);

describe("useCommandMenu", () => {
  it("starts closed until first opened", () => {
    const { result } = renderHook(() => useCommandMenu(keys));
    expect(result.current.open).toBeNull();
  });

  it("toggles open on ⌘K and Ctrl+K", () => {
    const { result } = renderHook(() => useCommandMenu(keys));
    press("k", { metaKey: true });
    expect(result.current.open).toBe(true);
    press("k", { ctrlKey: true });
    expect(result.current.open).toBe(false);
  });

  it("opens on / and on the open-command event", () => {
    const { result } = renderHook(() => useCommandMenu(keys));
    press("/");
    expect(result.current.open).toBe(true);
    expect(result.current.instant).toBe(true);
    act(() => result.current.setOpen(null));
    act(() => openCommandMenu());
    expect(result.current.open).toBe(true);
  });

  it("flips on the toggle-command event, as a trigger button sends it", () => {
    const { result } = renderHook(() => useCommandMenu(keys));
    act(() => toggleCommandMenu());
    expect(result.current.open).toBe(true);
    act(() => toggleCommandMenu());
    expect(result.current.open).toBe(false);
  });

  it("publishes whether it is open, and clears it on unmount", () => {
    const { result, unmount } = renderHook(() => useCommandMenu(keys));
    expect(getCommandMenuOpen()).toBe(false);
    act(() => openCommandMenu());
    expect(result.current.open).toBe(true);
    expect(getCommandMenuOpen()).toBe(true);
    unmount();
    expect(getCommandMenuOpen()).toBe(false);
  });

  it("navigates with router.push on g then a mapped key", () => {
    renderHook(() => useCommandMenu(keys));
    press("g");
    press("p");
    expect(push).toHaveBeenCalledWith("/projects");
  });
});
