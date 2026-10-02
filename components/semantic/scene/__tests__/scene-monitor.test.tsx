// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SceneMonitor } from "../scene-monitor";

vi.mock("@react-three/drei", () => ({
  PerformanceMonitor: () => <div data-testid="monitor" />,
}));
vi.mock("@react-three/fiber", () => ({
  useThree: (select: (state: { setDpr: () => void }) => unknown) =>
    select({ setDpr: () => {} }),
}));

afterEach(cleanup);

describe("SceneMonitor", () => {
  it("samples frames unless paused", () => {
    const view = render(<SceneMonitor />);
    expect(view.queryByTestId("monitor")).not.toBeNull();
    view.rerender(<SceneMonitor paused />);
    expect(view.queryByTestId("monitor")).toBeNull();
    view.rerender(<SceneMonitor paused={false} />);
    expect(view.queryByTestId("monitor")).not.toBeNull();
  });
});
