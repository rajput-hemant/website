// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ClickSound } from "../click-sound";

const sound = vi.hoisted(() => ({
  playTick: vi.fn(),
  playVoice: vi.fn(),
  suspendSound: vi.fn(),
}));

vi.mock("@/lib/sound", () => sound);

beforeEach(() => {
  sound.playTick.mockClear();
  sound.playVoice.mockClear();
  sound.suspendSound.mockClear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ClickSound", () => {
  it("keeps pointer ticks and skips keyboard link activation", () => {
    const { getByRole, unmount } = render(
      <>
        <ClickSound />
        <a href="/work" onClick={(event) => event.preventDefault()}>
          Work
        </a>
        <button>Switch</button>
      </>
    );

    fireEvent(
      getByRole("link"),
      new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })
    );
    fireEvent(
      getByRole("link"),
      new MouseEvent("click", { bubbles: true, cancelable: true, detail: 0 })
    );
    fireEvent(
      getByRole("button"),
      new MouseEvent("click", { bubbles: true, detail: 0 })
    );

    expect(sound.playTick.mock.calls).toEqual([["link"], ["button"]]);
    unmount();
    expect(sound.suspendSound).toHaveBeenCalledOnce();
  });

  it("passes named controls to the edition and observes disclosure toggles", () => {
    const voice = { gain: 0.1, layers: [] };
    const voiceFor = vi.fn((_element: Element, _event: MouseEvent) => voice);
    const onToggle = vi.fn(() => voice);
    const { getByRole, container, unmount } = render(
      <>
        <ClickSound voiceFor={voiceFor} onToggle={onToggle} />
        <button data-voice="confirm">
          <span>Confirm</span>
        </button>
        <details>
          <summary>More</summary>
        </details>
      </>
    );

    fireEvent(
      getByRole("button"),
      new MouseEvent("click", { bubbles: true, detail: 1 })
    );
    expect(voiceFor.mock.calls[0]?.[0]).toBe(getByRole("button"));
    expect(sound.playVoice).toHaveBeenCalledWith(voice);

    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    details?.dispatchEvent(new Event("toggle"));
    expect(onToggle).toHaveBeenCalledWith(details);
    expect(sound.playVoice).toHaveBeenCalledTimes(2);
    unmount();
  });

  it("keeps touch UI clicks silent unless a named voice is supplied", () => {
    class TouchClick extends MouseEvent {
      pointerType = "touch";
    }
    vi.stubGlobal("PointerEvent", TouchClick);
    const voice = { gain: 0.1, layers: [] };
    const voiceFor = vi.fn(() => voice);
    const { getByText } = render(
      <>
        <ClickSound voiceFor={voiceFor} />
        <button>Ordinary</button>
        <button data-voice="confirm">Confirm</button>
      </>
    );

    fireEvent(
      getByText("Ordinary"),
      new TouchClick("click", { bubbles: true, detail: 1 })
    );
    fireEvent(
      getByText("Confirm"),
      new TouchClick("click", { bubbles: true, detail: 1 })
    );

    expect(voiceFor).toHaveBeenCalledOnce();
    expect(sound.playVoice).toHaveBeenCalledOnce();
  });

  it("stays silent when the edition resolves no voice", () => {
    const voiceFor = vi.fn(() => null);
    const { getByRole } = render(
      <>
        <ClickSound voiceFor={voiceFor} />
        <button>Quiet</button>
      </>
    );

    fireEvent(
      getByRole("button"),
      new MouseEvent("click", { bubbles: true, detail: 1 })
    );
    expect(voiceFor).toHaveBeenCalledOnce();
    expect(sound.playVoice).not.toHaveBeenCalled();
    expect(sound.playTick).not.toHaveBeenCalled();
  });
});
