// @vitest-environment jsdom
import { hapticTrigger } from "ios-haptics";
import { afterEach, describe, expect, it, vi } from "vitest";

import { overlaySwitches } from "@/lib/haptic-switches";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1";

function mount(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("overlaySwitches", () => {
  it("attaches to switches and opted-in toggles, skipping quiet ones", () => {
    const root = mount(`
      <span role="switch" id="a"></span>
      <button data-haptic-switch id="b"></button>
      <div data-haptic="none"><span role="switch" id="c"></span></div>
      <button id="d"></button>
      <a href="#x" id="e"></a>
    `);
    const attach = vi.fn<(host: HTMLElement) => void>();
    const stop = overlaySwitches(root, attach);
    expect(attach.mock.calls.map(([host]) => host.id)).toEqual(["a", "b"]);
    stop();
  });

  it("follows toggles that mount later, until stopped", async () => {
    const root = mount("");
    const attach = vi.fn();
    const stop = overlaySwitches(root, attach);
    root.insertAdjacentHTML(
      "beforeend",
      '<section><span role="switch"></span></section>'
    );
    await vi.waitFor(() => expect(attach).toHaveBeenCalledOnce());

    stop();
    root.insertAdjacentHTML("beforeend", '<span role="switch"></span>');
    await Promise.resolve();
    expect(attach).toHaveBeenCalledOnce();
  });

  it("builds a hidden, unfocusable native switch and removes it on stop", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(IPHONE);
    const root = mount('<button data-haptic-switch id="theme">Theme</button>');
    const stop = overlaySwitches(root, hapticTrigger);

    const overlay = root.querySelector<HTMLInputElement>(
      "#theme > input[data-haptic-trigger]"
    );
    expect(overlay).not.toBeNull();
    expect(overlay?.type).toBe("checkbox");
    expect(overlay?.hasAttribute("switch")).toBe(true);
    expect(overlay?.getAttribute("aria-hidden")).toBe("true");
    expect(overlay?.tabIndex).toBe(-1);
    expect(overlay?.style.opacity).toBe("0");
    expect(overlay?.style.position).toBe("absolute");

    // Attaching twice keeps one overlay.
    hapticTrigger(root.querySelector("#theme"));
    expect(root.querySelectorAll("[data-haptic-trigger]")).toHaveLength(1);

    stop();
    expect(root.querySelector("[data-haptic-trigger]")).toBeNull();
  });

  it("lets the tap reach the control underneath", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(IPHONE);
    const root = mount('<button data-haptic-switch id="theme">Theme</button>');
    const onClick = vi.fn();
    root.querySelector("#theme")?.addEventListener("click", onClick);
    const stop = overlaySwitches(root, hapticTrigger);
    root.querySelector<HTMLElement>("[data-haptic-trigger]")?.click();
    expect(onClick).toHaveBeenCalledOnce();
    stop();
  });

  it("hands focus from the overlay to its control", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(IPHONE);
    const root = mount('<button data-haptic-switch id="theme">Theme</button>');
    const stop = overlaySwitches(root, hapticTrigger);
    root.querySelector<HTMLElement>("[data-haptic-trigger]")?.focus();
    expect(document.activeElement?.id).toBe("theme");
    stop();
  });

  it("puts the overlay back when the host's children are replaced", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(IPHONE);
    const root = mount('<button data-haptic-switch id="theme">Light</button>');
    const attach = vi.fn(hapticTrigger);
    const stop = overlaySwitches(root, attach);
    const host = root.querySelector<HTMLElement>("#theme");
    if (!host) throw new Error("no host");

    // What React does for a single text child.
    host.textContent = "Dark";
    await vi.waitFor(() =>
      expect(
        host.querySelector(":scope > [data-haptic-trigger]")
      ).not.toBeNull()
    );
    expect(host.textContent).toBe("Dark");
    expect(root.querySelectorAll("[data-haptic-trigger]")).toHaveLength(1);

    // Settles: the re-attach does not keep re-triggering itself.
    const calls = attach.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(attach.mock.calls.length).toBe(calls);
    stop();
  });

  it("leaves quiet hosts alone when their children are replaced", async () => {
    const root = mount(
      '<div data-haptic="none"><span role="switch" id="q">a</span></div>'
    );
    const attach = vi.fn();
    const stop = overlaySwitches(root, attach);
    const host = root.querySelector("#q");
    host?.insertAdjacentHTML("beforeend", "<i data-haptic-trigger></i>");
    await Promise.resolve();
    if (host) host.textContent = "b";
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(attach).not.toHaveBeenCalled();
    stop();
  });

  it("restores the host's own positioning on stop", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(IPHONE);
    const root = mount(`
      <button data-haptic-switch id="static">A</button>
      <button data-haptic-switch id="fixed" style="position: absolute">B</button>
    `);
    const stop = overlaySwitches(root, hapticTrigger);
    const plain = root.querySelector<HTMLElement>("#static");
    const placed = root.querySelector<HTMLElement>("#fixed");
    expect(plain?.style.position).toBe("relative");
    expect(placed?.style.position).toBe("absolute");

    stop();
    expect(plain?.style.position).toBe("");
    expect(placed?.style.position).toBe("absolute");
  });
});
