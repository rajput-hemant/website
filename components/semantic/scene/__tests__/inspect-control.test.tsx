// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let coarse = false;
let mac = false;

beforeEach(() => {
  // Fresh module state: whether any inspect was used is page-wide.
  vi.resetModules();
  localStorage.clear();
  coarse = false;
  mac = false;
  vi.spyOn(navigator, "userAgent", "get").mockImplementation(() =>
    mac ? "Mozilla/5.0 (Macintosh; Intel Mac OS X)" : "Mozilla/5.0 (X11; Linux)"
  );
  window.matchMedia = (query: string) => ({
    matches: coarse && query.includes("coarse"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
});

afterEach(cleanup);

async function load() {
  const scene = await import("@/lib/scene/inspect");
  const ui = await import("../inspect-control");
  return { ...scene, ...ui };
}

describe("InspectControl", () => {
  it("renders only while the host has a bound inspect", async () => {
    const { InspectControl, bindInspect, createInspect, INSPECT_LABEL } =
      await load();
    const host = document.createElement("div");
    const target = { current: host };
    const view = render(<InspectControl target={target} className="kb" />);
    expect(view.queryByRole("group")).toBeNull();
    const inspect = createInspect();
    let off = () => {};
    act(() => {
      off = bindInspect(host, inspect);
    });
    const group = view.getByRole("group", { name: INSPECT_LABEL });
    expect(group.className).toBe("kb");
    expect(view.getAllByRole("button").map((b) => b.ariaLabel)).toEqual([
      "Turn left",
      "Turn right",
      "Zoom in",
      "Zoom out",
      "Reset view",
    ]);
    act(() => off());
    expect(view.queryByRole("group")).toBeNull();
  });

  it("drives the inspect from the keyboard; only Reset resets on activation", async () => {
    const { InspectControl, bindInspect, createInspect, KEY_YAW } =
      await load();
    const host = document.createElement("div");
    const inspect = createInspect();
    const off = bindInspect(host, inspect);
    const view = render(<InspectControl target={{ current: host }} />);
    const turnRight = view.getByRole("button", { name: "Turn right" });
    const right = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    turnRight.dispatchEvent(right);
    expect(right.defaultPrevented).toBe(true);
    expect(inspect.target.yaw).toBeCloseTo(KEY_YAW);
    fireEvent.keyDown(turnRight, { key: "+" });
    expect(inspect.target.zoom).toBeGreaterThan(1);
    // Modified keys and other keys pass through to the browser.
    const tab = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    turnRight.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    const enter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    turnRight.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(false);
    fireEvent.keyDown(turnRight, { key: "ArrowRight", metaKey: true });
    expect(inspect.target.yaw).toBeCloseTo(KEY_YAW);
    // Each button does its own thing on activation.
    fireEvent.click(turnRight);
    expect(inspect.target.yaw).toBeCloseTo(2 * KEY_YAW);
    fireEvent.click(view.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(view.getByRole("button", { name: "Turn left" }));
    expect(inspect.target.yaw).toBeCloseTo(KEY_YAW);
    fireEvent.click(view.getByRole("button", { name: "Reset view" }));
    expect(inspect.target).toEqual({ yaw: 0, pitch: 0, zoom: 1 });
    off();
  });

  it("announces keyboard use politely, throttled", async () => {
    vi.useFakeTimers();
    try {
      const { InspectControl, bindInspect, createInspect } = await load();
      const host = document.createElement("div");
      const inspect = createInspect();
      const off = bindInspect(host, inspect);
      const view = render(<InspectControl target={{ current: host }} />);
      const status = view.getByRole("status");
      // Input while focus is elsewhere (a drag) says nothing.
      act(() => {
        inspect.rotateBy(1, 0);
        vi.advanceTimersByTime(2000);
      });
      expect(status.textContent).toBe("");
      const left = view.getByRole("button", { name: "Turn left" });
      act(() => left.focus());
      inspect.reset();
      act(() => {
        for (let i = 0; i < 3; i++) inspect.key("ArrowRight");
        inspect.key("+");
        vi.advanceTimersByTime(2000);
      });
      expect(status.textContent).toBe("Turned 45 degrees, zoom 120%");
      off();
    } finally {
      vi.useRealTimers();
    }
  });

  it("parks focus on the container when the scene is lent away", async () => {
    const { InspectControl, bindInspect, createInspect } = await load();
    const home = document.createElement("div");
    const host = document.createElement("div");
    home.append(host);
    document.body.append(home);
    const off = bindInspect(host, createInspect());
    const view = render(<InspectControl target={{ current: host }} />);
    const button = view.getByRole("button", { name: "Zoom in" });
    act(() => button.focus());
    const focus = vi.spyOn(home, "focus");
    act(() => off());
    expect(view.queryByRole("group")).toBeNull();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(home);
    home.blur();
    expect(home.hasAttribute("tabindex")).toBe(false);
    home.remove();
  });
});

describe("InspectHint", () => {
  it("shows once the model is live and hides for good after first use", async () => {
    const { InspectHint, bindInspect, createInspect } = await load();
    const host = document.createElement("div");
    const target = { current: host };
    const view = render(<InspectHint target={target} className="hint" />);
    expect(view.container.textContent).toBe("");
    const inspect = createInspect();
    act(() => {
      bindInspect(host, inspect);
    });
    const hint = view.container.querySelector("[data-inspect-hint]");
    expect(hint?.textContent).toBe("drag to rotate · ctrl + scroll to zoom");
    expect(hint?.getAttribute("aria-hidden")).toBe("true");
    act(() => {
      inspect.key("ArrowLeft");
    });
    expect(view.container.querySelector("[data-inspect-hint]")).toBeNull();
    expect(localStorage.getItem("inspect.hint")).toBe("1");
  });

  it("says cmd on a Mac", async () => {
    mac = true;
    const { InspectHint, bindInspect, createInspect } = await load();
    const host = document.createElement("div");
    bindInspect(host, createInspect());
    const view = render(<InspectHint target={{ current: host }} />);
    expect(view.container.textContent).toBe(
      "drag to rotate · cmd + scroll to zoom"
    );
  });

  it("says pinch on touch, takes an edition's text, and stays hidden once seen", async () => {
    coarse = true;
    const { InspectHint, bindInspect, createInspect } = await load();
    const host = document.createElement("div");
    bindInspect(host, createInspect());
    const touch = render(<InspectHint target={{ current: host }} />);
    expect(touch.container.textContent).toBe(
      "swipe sideways to rotate · pinch to zoom"
    );
    touch.unmount();
    const own = render(<InspectHint target={{ current: host }} text="turn" />);
    expect(own.container.textContent).toBe("turn");
    own.unmount();
    localStorage.setItem("inspect.hint", "1");
    const seen = render(<InspectHint target={{ current: host }} />);
    expect(seen.container.textContent).toBe("");
  });
});
