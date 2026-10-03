// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { isApplePlatform, ShortcutLabel } from "../shortcut-label";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete document.documentElement.dataset.platform;
});

describe("ShortcutLabel", () => {
  it("renders both labels, for the platform CSS to pick between", () => {
    const { container } = render(<ShortcutLabel />);
    expect(container.textContent).toBe("Ctrl K⌘K");
  });

  it("sets the platform on the root when no pre-paint script did", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    );
    render(<ShortcutLabel />);
    expect(document.documentElement.dataset.platform).toBe("apple");
  });

  it("leaves a platform the script already set alone", () => {
    document.documentElement.dataset.platform = "other";
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Macintosh");
    render(<ShortcutLabel />);
    expect(document.documentElement.dataset.platform).toBe("other");
  });

  it("detects Apple platforms by user agent", () => {
    const ua = vi.spyOn(navigator, "userAgent", "get");
    ua.mockReturnValue("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)");
    expect(isApplePlatform()).toBe(true);
    ua.mockReturnValue("Mozilla/5.0 (X11; Linux x86_64)");
    expect(isApplePlatform()).toBe(false);
  });
});
