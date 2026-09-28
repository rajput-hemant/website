// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HapticKind } from "@/lib/haptics";

import { TouchHaptics } from "../touch-haptics";

const haptics = vi.hoisted(() => ({
  haptic: vi.fn(),
  preloadHaptics: vi.fn(() => Promise.resolve(null)),
  cancelHaptics: vi.fn(),
}));

vi.mock("@/lib/haptics", () => haptics);

const tap = (target: Element, pointerType = "touch", detail = 1) =>
  fireEvent(
    target,
    new PointerEvent("click", { bubbles: true, pointerType, detail })
  );

beforeEach(() => {
  haptics.haptic.mockClear();
  haptics.preloadHaptics.mockClear();
  haptics.cancelHaptics.mockClear();
});

afterEach(() => {
  cleanup();
});

describe("TouchHaptics", () => {
  it("answers touch taps only: buttons and links tap, switches select", () => {
    const { getByText, getByRole, unmount } = render(
      <>
        <TouchHaptics />
        <a href="#top">Top</a>
        <button>Go</button>
        <button role="switch" aria-checked="false">
          Sound
        </button>
        <input type="radio" aria-label="Day" />
        <p>Prose</p>
      </>
    );

    tap(getByText("Top"));
    tap(getByText("Go"));
    tap(getByRole("switch"));
    tap(getByRole("radio"));
    tap(getByText("Prose"));
    tap(getByText("Go"), "mouse");
    tap(getByText("Go"), "pen");

    expect(haptics.haptic.mock.calls).toEqual([
      ["tap"],
      ["tap"],
      ["select"],
      ["select"],
      ["tap"],
    ]);
    unmount();
    expect(haptics.cancelHaptics).toHaveBeenCalled();
  });

  it("skips keyboard activation and scripted clicks", () => {
    const { getByText } = render(
      <>
        <TouchHaptics />
        <button>Go</button>
      </>
    );
    tap(getByText("Go"), "touch", 0);
    fireEvent(getByText("Go"), new MouseEvent("click", { bubbles: true }));
    expect(haptics.haptic).not.toHaveBeenCalled();
  });

  it("starts loading the engine on a touch press, and credits a plain click to it", () => {
    const { getByText } = render(
      <>
        <TouchHaptics />
        <button>Go</button>
      </>
    );
    const button = getByText("Go");
    fireEvent(
      button,
      new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" })
    );
    expect(haptics.preloadHaptics).not.toHaveBeenCalled();
    fireEvent(
      button,
      new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" })
    );
    expect(haptics.preloadHaptics).toHaveBeenCalledOnce();

    fireEvent(button, new MouseEvent("click", { bubbles: true, detail: 1 }));
    expect(haptics.haptic).toHaveBeenCalledWith("tap");
  });

  it("lets data-haptic override the kind or silence a control", () => {
    const hapticFor = vi.fn((): HapticKind | null => "nudge");
    const { getByText } = render(
      <>
        <TouchHaptics hapticFor={hapticFor} />
        <button data-haptic="success">Send</button>
        <div data-haptic="none">
          <button>Quiet</button>
        </div>
        <button data-haptic="bogus">Edition</button>
      </>
    );

    tap(getByText("Send"));
    tap(getByText("Quiet"));
    tap(getByText("Edition"));

    expect(haptics.haptic.mock.calls).toEqual([["success"], ["nudge"]]);
    expect(hapticFor).toHaveBeenCalledOnce();
  });

  it("does nothing when disabled", () => {
    const { getByText } = render(
      <>
        <TouchHaptics enabled={false} />
        <button>Go</button>
      </>
    );
    tap(getByText("Go"));
    expect(haptics.haptic).not.toHaveBeenCalled();
  });
});
