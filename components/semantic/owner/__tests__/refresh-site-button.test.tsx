// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RefreshSiteButton } from "../refresh-site-button";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  getOwnerSession: vi.fn(),
  refreshSiteContent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/lib/ask/client", () => ({
  getOwnerSession: mocks.getOwnerSession,
  refreshSiteContent: mocks.refreshSiteContent,
}));

afterEach(() => vi.clearAllMocks());

describe("RefreshSiteButton", () => {
  it("renders nothing for visitors", async () => {
    mocks.getOwnerSession.mockResolvedValue({ ok: true, owner: false });
    const { container } = render(<RefreshSiteButton />);
    await waitFor(() => expect(mocks.getOwnerSession).toHaveBeenCalled());
    expect(container.innerHTML).toBe("");
  });

  it("refreshes the cache, then the page, and confirms", async () => {
    mocks.getOwnerSession.mockResolvedValue({ ok: true, owner: true });
    mocks.refreshSiteContent.mockResolvedValue({ ok: true });
    render(<RefreshSiteButton className="x" />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Refresh site content" })
    );
    await screen.findByText("Refreshed");
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("shows the server's error and does not refresh the page", async () => {
    mocks.getOwnerSession.mockResolvedValue({ ok: true, owner: true });
    mocks.refreshSiteContent.mockResolvedValue({
      ok: false,
      status: 401,
      message: "Sign in at /owner to do that.",
    });
    render(<RefreshSiteButton />);
    fireEvent.click(await screen.findByRole("button"));
    await screen.findByText("Sign in at /owner to do that.");
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
