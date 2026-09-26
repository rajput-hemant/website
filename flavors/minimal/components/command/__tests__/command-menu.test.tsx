// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { openCommandMenu } from "../command-events";
import { CommandMenu } from "../command-menu";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/dynamic", () => ({
  default: () =>
    function DialogStub({ open }: { open: boolean }) {
      return <div data-testid="dialog" data-open={String(open)} />;
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

  it("renders nothing, and loads nothing, until first opened", () => {
    render(<CommandMenu />);
    expect(dialog()).toBeNull();
  });

  it("toggles on ⌘K and Ctrl+K", () => {
    render(<CommandMenu />);
    press("k", { metaKey: true });
    expect(dialog()?.dataset.open).toBe("true");
    press("k", { ctrlKey: true });
    expect(dialog()?.dataset.open).toBe("false");
  });

  it("opens on / and on the trigger's event", () => {
    render(<CommandMenu />);
    press("/");
    expect(dialog()?.dataset.open).toBe("true");
    cleanup();
    render(<CommandMenu />);
    act(() => openCommandMenu());
    expect(dialog()?.dataset.open).toBe("true");
  });

  it("navigates on g then a page key", () => {
    render(<CommandMenu />);
    press("g");
    press("p");
    expect(push).toHaveBeenCalledWith("/projects");
    press("g");
    press("l");
    expect(push).toHaveBeenLastCalledWith("/lab");
  });

  it("ignores / and g sequences while typing, but not ⌘K", () => {
    render(
      <>
        <input aria-label="field" />
        <CommandMenu />
      </>
    );
    const input = screen.getByLabelText("field");
    press("/", {}, input);
    press("g", {}, input);
    press("w", {}, input);
    expect(dialog()).toBeNull();
    expect(push).not.toHaveBeenCalled();
    press("k", { metaKey: true }, input);
    expect(dialog()?.dataset.open).toBe("true");
  });
});
