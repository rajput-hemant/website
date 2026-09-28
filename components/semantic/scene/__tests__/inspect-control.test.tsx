// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let coarse = false;

beforeEach(() => {
  // Fresh module state: whether any inspect was used is page-wide.
  vi.resetModules();
  localStorage.clear();
  coarse = false;
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
    expect(view.queryByRole("button")).toBeNull();
    const inspect = createInspect();
    let off = () => {};
    act(() => {
      off = bindInspect(host, inspect);
    });
    const button = view.getByRole("button", { name: INSPECT_LABEL });
    expect(button.className).toBe("kb");
    act(() => off());
    expect(view.queryByRole("button")).toBeNull();
  });

  it("drives the inspect from the keyboard and resets on activation", async () => {
    const { InspectControl, bindInspect, createInspect, KEY_YAW } =
      await load();
    const host = document.createElement("div");
    const inspect = createInspect();
    const off = bindInspect(host, inspect);
    const view = render(<InspectControl target={{ current: host }} />);
    const button = view.getByRole("button");
    const right = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(right);
    expect(right.defaultPrevented).toBe(true);
    expect(inspect.target.yaw).toBeCloseTo(KEY_YAW);
    fireEvent.keyDown(button, { key: "+" });
    expect(inspect.target.zoom).toBeGreaterThan(1);
    // Modified keys and other keys pass through to the browser.
    const tab = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    fireEvent.keyDown(button, { key: "ArrowRight", metaKey: true });
    expect(inspect.target.yaw).toBeCloseTo(KEY_YAW);
    fireEvent.click(button);
    expect(inspect.target).toEqual({ yaw: 0, pitch: 0, zoom: 1 });
    off();
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
    expect(localStorage.getItem("hr.inspect.hint")).toBe("1");
  });

  it("says pinch on touch, takes an edition's text, and stays hidden once seen", async () => {
    coarse = true;
    const { InspectHint, bindInspect, createInspect } = await load();
    const host = document.createElement("div");
    bindInspect(host, createInspect());
    const touch = render(<InspectHint target={{ current: host }} />);
    expect(touch.container.textContent).toBe("drag to rotate · pinch to zoom");
    touch.unmount();
    const own = render(<InspectHint target={{ current: host }} text="turn" />);
    expect(own.container.textContent).toBe("turn");
    own.unmount();
    localStorage.setItem("hr.inspect.hint", "1");
    const seen = render(<InspectHint target={{ current: host }} />);
    expect(seen.container.textContent).toBe("");
  });
});
