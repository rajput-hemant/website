// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterPins } from "../register-pins";

const sound = vi.hoisted(() => ({
  isSoundOn: vi.fn(() => true),
  playVoice: vi.fn(() => true),
}));
const path = vi.hoisted(() => ({ current: "/" }));

vi.mock("@/lib/sound", () => sound);
vi.mock("@/lib/public-pathname", () => ({
  usePublicPathname: () => path.current,
}));

function enter(target: Element, pointerType: string) {
  target.dispatchEvent(new PointerEvent("pointerenter", { pointerType }));
}

beforeEach(() => {
  sound.playVoice.mockClear();
  sound.isSoundOn.mockReturnValue(true);
  path.current = "/";
});

afterEach(cleanup);

describe("RegisterPins", () => {
  it("seats the pins once per view, for a mouse on a register headline", () => {
    const { getByRole, getByText } = render(
      <>
        <RegisterPins enabled />
        <h1 data-register>
          <span>Title</span>
        </h1>
      </>
    );
    enter(getByText("Title"), "mouse");
    enter(getByRole("heading"), "touch");
    expect(sound.playVoice).not.toHaveBeenCalled();
    enter(getByRole("heading"), "mouse");
    enter(getByRole("heading"), "pen");
    expect(sound.playVoice).toHaveBeenCalledOnce();
  });

  it("stays silent when sound is off or the layer is disabled", () => {
    sound.isSoundOn.mockReturnValue(false);
    const { getByRole, rerender } = render(
      <>
        <RegisterPins enabled />
        <h1 data-register>Title</h1>
      </>
    );
    enter(getByRole("heading"), "mouse");
    sound.isSoundOn.mockReturnValue(true);
    rerender(
      <>
        <RegisterPins enabled={false} />
        <h1 data-register>Title</h1>
      </>
    );
    enter(getByRole("heading"), "mouse");
    expect(sound.playVoice).not.toHaveBeenCalled();
  });
});
