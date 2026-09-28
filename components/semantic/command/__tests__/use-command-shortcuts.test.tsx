// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { openCommandMenu } from "@/lib/command/events";

import { useCommandShortcuts } from "../use-command-shortcuts";

const keys = { p: "/projects", h: "/" } as const;

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

function setup() {
  const handlers = { onOpen: vi.fn(), onToggle: vi.fn(), navigate: vi.fn() };
  renderHook(() => useCommandShortcuts({ keys, ...handlers }));
  return handlers;
}

afterEach(cleanup);

describe("useCommandShortcuts", () => {
  it("toggles on ⌘K and Ctrl+K, even from a text field", () => {
    const h = setup();
    press("k", { metaKey: true });
    const input = document.body.appendChild(document.createElement("input"));
    press("k", { ctrlKey: true }, input);
    input.remove();
    expect(h.onToggle).toHaveBeenCalledTimes(2);
  });

  it("opens on / and on the open-command event, but not while typing", () => {
    const h = setup();
    press("/");
    act(() => openCommandMenu());
    const input = document.body.appendChild(document.createElement("input"));
    press("/", {}, input);
    input.remove();
    expect(h.onOpen).toHaveBeenCalledTimes(2);
  });

  it("jumps with g then a mapped key", () => {
    const h = setup();
    press("g");
    press("p");
    expect(h.navigate).toHaveBeenCalledWith("/projects");
  });

  it("stops listening on unmount", () => {
    const handlers = { onOpen: vi.fn(), onToggle: vi.fn(), navigate: vi.fn() };
    const { unmount } = renderHook(() =>
      useCommandShortcuts({ keys, ...handlers })
    );
    unmount();
    press("k", { metaKey: true });
    expect(handlers.onToggle).not.toHaveBeenCalled();
  });
});
