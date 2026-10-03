// @vitest-environment jsdom
import * as React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useTriggerToggle } from "../use-trigger-toggle";

/**
 * A popup anchored to a plain button, closed by an outside press on pointerdown
 * the way Base UI does (the button counts as outside).
 */
function Harness() {
  const [open, setOpen] = React.useState(false);
  const toggle = useTriggerToggle(open, setOpen);
  React.useEffect(() => {
    const outside = () => setOpen(false);
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <button type="button" aria-expanded={open} {...toggle}>
      Customize
    </button>
  );
}

const button = () => screen.getByRole("button", { name: "Customize" });
const expanded = () => button().getAttribute("aria-expanded");

function press() {
  act(() => {
    fireEvent.pointerDown(button());
    fireEvent.click(button());
  });
}

afterEach(cleanup);

describe("useTriggerToggle", () => {
  it("opens on the first press and closes on the second, once each", () => {
    render(<Harness />);
    expect(expanded()).toBe("false");
    press();
    expect(expanded()).toBe("true");
    press();
    expect(expanded()).toBe("false");
    press();
    expect(expanded()).toBe("true");
  });

  it("toggles on a keyboard click, which has no pointerdown", () => {
    render(<Harness />);
    act(() => {
      fireEvent.click(button());
    });
    expect(expanded()).toBe("true");
    act(() => {
      fireEvent.click(button());
    });
    expect(expanded()).toBe("false");
  });
});
