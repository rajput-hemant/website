// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ModerationItem } from "@/lib/data/types";

import {
  moderationItemId,
  useModerationItem,
  useModerationQueue,
} from "../use-moderation";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  getModeration: vi.fn(),
  moderate: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/lib/ask/client", () => ({
  getModeration: mocks.getModeration,
  moderate: mocks.moderate,
}));

const thread: ModerationItem = {
  kind: "thread",
  slug: "a",
  body: "Hello there",
  submittedAt: "2026-09-01T00:00:00Z",
  status: "pending",
};
const reply: ModerationItem = {
  kind: "reply",
  slug: "b",
  threadBody: "Thread",
  reply: {
    key: "k1",
    by: "visitor",
    body: "Spammy",
    createdAt: "2026-09-02T00:00:00Z",
    status: "spam",
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("useModerationQueue", () => {
  it("loads, counts pending items and drops resolved ones", async () => {
    mocks.getModeration.mockResolvedValue({ ok: true, items: [thread, reply] });
    const { result } = renderHook(() => useModerationQueue());
    expect(result.current.queue.state).toBe("loading");
    await waitFor(() => expect(result.current.queue.state).toBe("ready"));
    expect(result.current.pendingCount).toBe(1);

    act(() => result.current.resolve(thread));
    expect(result.current.queue).toEqual({ state: "ready", items: [reply] });
  });

  it("reports a failed load", async () => {
    mocks.getModeration.mockResolvedValue({ ok: false, message: "Nope" });
    const { result } = renderHook(() => useModerationQueue());
    await waitFor(() =>
      expect(result.current.queue).toEqual({ state: "error", message: "Nope" })
    );
  });
});

describe("useModerationItem", () => {
  it("offers no spam action on an item already flagged", () => {
    const { result } = renderHook(() => useModerationItem(reply, () => {}));
    expect(result.current.flagged).toBe(true);
    expect(result.current.actions).toEqual(["publish", "reject"]);
    expect(moderationItemId(reply)).toBe("b:k1");
  });

  it("targets the thread or the reply, then resolves and refreshes", async () => {
    mocks.moderate.mockResolvedValue({ ok: true });
    const onResolved = vi.fn();
    const { result } = renderHook(() => useModerationItem(reply, onResolved));
    await act(() => result.current.run("reject"));
    expect(mocks.moderate).toHaveBeenCalledWith({
      slug: "b",
      target: "k1",
      action: "reject",
    });
    expect(onResolved).toHaveBeenCalled();
    expect(mocks.refresh).toHaveBeenCalled();
    expect(result.current.busy).toBeNull();
  });

  it("keeps the item and shows the error when an action fails", async () => {
    mocks.moderate.mockResolvedValue({ ok: false, message: "Failed" });
    const onResolved = vi.fn();
    const { result } = renderHook(() => useModerationItem(thread, onResolved));
    await act(() => result.current.run("publish"));
    expect(mocks.moderate).toHaveBeenCalledWith({
      slug: "a",
      target: "thread",
      action: "publish",
    });
    expect(result.current.error).toBe("Failed");
    expect(onResolved).not.toHaveBeenCalled();
  });
});
