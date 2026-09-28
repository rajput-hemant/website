// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "../theme-toggle";

const plates = vi.hoisted(() => ({
  swapPlates: vi.fn<(theme: string, options?: { voice?: boolean }) => void>(),
}));

vi.mock("@/flavors/press/lib/interaction/plate-swap", () => plates);

beforeEach(() => {
  plates.swapPlates.mockClear();
});

afterEach(cleanup);

const voiced = () => plates.swapPlates.mock.calls.at(-1)?.[1]?.voice;

describe("ThemeToggle", () => {
  it("sounds the plate swap for a mouse click", () => {
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole("button");
    fireEvent.pointerDown(button, { pointerType: "mouse" });
    fireEvent.click(button, { detail: 1 });
    expect(voiced()).toBe(true);
  });

  it("stays silent on touch, even when the click is not a touch PointerEvent", () => {
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole("button");
    // The iOS switch overlay: the tap lands on a child and its click bubbles.
    const overlay = document.createElement("input");
    button.append(overlay);
    fireEvent.pointerDown(overlay, { pointerType: "touch" });
    fireEvent.click(overlay, { detail: 1 });
    expect(voiced()).toBe(false);
  });

  it("sounds for a keyboard click after an earlier tap", () => {
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole("button");
    fireEvent.pointerDown(button, { pointerType: "touch" });
    fireEvent.click(button, { detail: 0 });
    expect(voiced()).toBe(true);
  });
});
