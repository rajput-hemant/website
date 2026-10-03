// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ShortcutLabel } from "../shortcut-label";

afterEach(cleanup);

describe("ShortcutLabel", () => {
  it("renders both labels, for the platform CSS to pick between", () => {
    const { container } = render(<ShortcutLabel />);
    expect(container.querySelector('[data-hint="other"]')?.textContent).toBe(
      "Ctrl K"
    );
    expect(container.querySelector('[data-hint="apple"]')?.textContent).toBe(
      "⌘K"
    );
  });
});
