// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VisitorCounter } from "../visitor-counter";

const animatedCount = vi.fn();
vi.mock("../animated-count", () => ({
  AnimatedCount: (props: { from: number; to: number; animated: boolean }) => {
    animatedCount(props);
    return <span data-testid="flow">{props.to}</span>;
  },
}));

let motion = true;
vi.mock("@/flavors/minimal/lib/prefs-store", () => ({
  usePrefs: () => ({ motion }),
}));

function respond(status: number, body: unknown) {
  return vi.fn(async () => Response.json(body, { status }));
}

beforeEach(() => {
  motion = true;
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.requestIdleCallback = (task) =>
    window.setTimeout(() => task({} as IdleDeadline), 0);
  window.cancelIdleCallback = (handle) => window.clearTimeout(handle);
});

afterEach(() => {
  cleanup();
  animatedCount.mockClear();
  vi.unstubAllGlobals();
});

describe("VisitorCounter", () => {
  it("posts once per session, then reads, and announces the plain number", async () => {
    const fetchMock = respond(200, { visitors: 12_408 });
    vi.stubGlobal("fetch", fetchMock);

    render(<VisitorCounter enabled />);
    expect(await screen.findByText("12,408 visitors")).toHaveProperty(
      "className",
      "sr-only"
    );
    await screen.findByTestId("flow");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/visits",
      expect.objectContaining({ method: "POST", body: "{}" })
    );
    expect(animatedCount).toHaveBeenLastCalledWith({
      from: 0,
      to: 12_408,
      animated: true,
    });

    cleanup();
    render(<VisitorCounter enabled />);
    await screen.findByText("12,408 visitors");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/visits",
      expect.not.objectContaining({ method: "POST" })
    );
  });

  it("rolls up from the last count this browser saw", async () => {
    window.localStorage.setItem("hr.visitors", "12400");
    vi.stubGlobal("fetch", respond(200, { visitors: 12_408 }));

    render(<VisitorCounter enabled />);
    await screen.findByTestId("flow");
    expect(animatedCount).toHaveBeenLastCalledWith(
      expect.objectContaining({ from: 12_400, to: 12_408 })
    );
    expect(window.localStorage.getItem("hr.visitors")).toBe("12408");
  });

  it("ignores a cached count larger than the real one", async () => {
    window.localStorage.setItem("hr.visitors", "99999");
    vi.stubGlobal("fetch", respond(200, { visitors: 5 }));

    render(<VisitorCounter enabled />);
    await screen.findByTestId("flow");
    expect(animatedCount).toHaveBeenLastCalledWith(
      expect.objectContaining({ from: 0, to: 5 })
    );
  });

  it("turns animation off with the motion preference", async () => {
    motion = false;
    vi.stubGlobal("fetch", respond(200, { visitors: 1 }));

    render(<VisitorCounter enabled />);
    expect(await screen.findByText("1 visitor")).toBeTruthy();
    await screen.findByTestId("flow");
    expect(animatedCount).toHaveBeenLastCalledWith(
      expect.objectContaining({ animated: false })
    );
  });

  it("renders nothing when the counter is off", async () => {
    const fetchMock = respond(503, { error: "off" });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<VisitorCounter enabled />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(container.innerHTML).toBe(""));
    expect(window.sessionStorage.getItem("hr.visit-posted")).toBeNull();
  });

  it("never requests when the server has no counter", async () => {
    const fetchMock = respond(200, { visitors: 1 });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<VisitorCounter enabled={false} />);
    expect(container.innerHTML).toBe("");
    await new Promise((resolve) => window.setTimeout(resolve, 10));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
