// @vitest-environment jsdom
import * as React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCommandMenu } from "../use-command-menu";
import { useCommandTrigger } from "../use-command-trigger";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

/**
 * The menu plus its trigger button. While open, a press anywhere closes the
 * menu on pointerdown, as a modal's outside press does (the trigger is outside
 * it, behind the backdrop).
 */
function Harness() {
  const { open, setOpen } = useCommandMenu({});
  const trigger = useCommandTrigger();
  React.useEffect(() => {
    if (!open) return;
    const outside = () => setOpen(false);
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, setOpen]);
  return (
    <>
      <button type="button" {...trigger}>
        Search
      </button>
      {open ? <div role="dialog" /> : null}
    </>
  );
}

const button = () => screen.getByRole("button", { name: "Search" });
const dialog = () => screen.queryByRole("dialog");

/** A mouse click: pointerdown, then click. */
function click() {
  act(() => {
    fireEvent.pointerDown(button());
  });
  act(() => {
    fireEvent.click(button(), { detail: 1 });
  });
}

afterEach(cleanup);

describe("useCommandTrigger", () => {
  it("opens on click and closes on the second click, not reopening", () => {
    render(<Harness />);
    expect(button().getAttribute("aria-expanded")).toBe("false");
    expect(button().getAttribute("aria-haspopup")).toBe("dialog");

    click();
    expect(dialog()).not.toBeNull();
    expect(button().getAttribute("aria-expanded")).toBe("true");

    click();
    expect(dialog()).toBeNull();
    expect(button().getAttribute("aria-expanded")).toBe("false");

    click();
    expect(dialog()).not.toBeNull();
  });

  it("closes on a keyboard click, which has no pointerdown", () => {
    render(<Harness />);
    act(() => {
      fireEvent.click(button(), { detail: 0 });
    });
    expect(dialog()).not.toBeNull();
    act(() => {
      fireEvent.click(button(), { detail: 0 });
    });
    expect(dialog()).toBeNull();
  });

  it("still closes with ⌘K after the trigger opened it", () => {
    render(<Harness />);
    click();
    act(() => {
      fireEvent.keyDown(window, { key: "k", code: "KeyK", metaKey: true });
    });
    expect(dialog()).toBeNull();
  });
});
