// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OPEN_COMMAND_EVENT } from "@/lib/command/events";

import { CommandMenu } from "../command-menu";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/dynamic", () => ({
  default: () =>
    function DialogStub({
      open,
      instantOpen,
    }: {
      open: boolean;
      instantOpen?: boolean;
    }) {
      if (!open) return null;
      return (
        <div data-testid="dialog" data-instant-open={String(instantOpen)} />
      );
    },
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

const dialog = () => screen.queryByTestId("dialog");

describe("CommandMenu", () => {
  beforeEach(() => push.mockClear());
  afterEach(cleanup);

  it("sets instantOpen on the first render for each open path", () => {
    render(<CommandMenu />);

    press("k", { metaKey: true });
    expect(dialog()?.getAttribute("data-instant-open")).toBe("true");

    press("k", { metaKey: true });
    expect(dialog()).toBeNull();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(OPEN_COMMAND_EVENT, { detail: { pointer: true } })
      );
    });
    expect(dialog()?.getAttribute("data-instant-open")).toBe("false");

    press("k", { metaKey: true });
    expect(dialog()).toBeNull();

    press("k", { metaKey: true });
    expect(dialog()?.getAttribute("data-instant-open")).toBe("true");
  });
});
