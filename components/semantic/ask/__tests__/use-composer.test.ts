// @vitest-environment jsdom
import type * as React from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { askMessages } from "@/lib/ask/response";

import { PENDING_KEY } from "../pending-messages";
import { NAME_KEY, useAskComposer } from "../use-composer";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  postThread: vi.fn(),
  postReply: vi.fn(),
  owner: false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/lib/ask/client", () => ({
  postThread: mocks.postThread,
  postReply: mocks.postReply,
}));
vi.mock("../owner-provider", () => ({
  useOwner: () => ({ ready: true, owner: mocks.owner, setOwner: () => {} }),
}));

function form(fields: Record<string, string>) {
  const el = document.createElement("form");
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.name = name;
    input.value = value;
    el.append(input);
  }
  return el;
}

async function submit(
  handle: (event: React.FormEvent<HTMLFormElement>) => void,
  fields: Record<string, string>
) {
  const currentTarget = form(fields);
  await act(async () => {
    handle({
      preventDefault: () => {},
      currentTarget,
    } as unknown as React.FormEvent<HTMLFormElement>);
    // Let the async send settle.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

let clock = 0;

beforeEach(() => {
  mocks.owner = false;
  clock = 0;
  // Past the anti-bot window as soon as the composer has mounted.
  vi.spyOn(performance, "now").mockImplementation(() => (clock += 10_000));
});

afterEach(() => {
  vi.restoreAllMocks();
  mocks.refresh.mockReset();
  mocks.postThread.mockReset();
  mocks.postReply.mockReset();
  localStorage.clear();
});

describe("useAskComposer", () => {
  it("flags a too-short body without sending", async () => {
    const { result } = renderHook(() => useAskComposer({}));
    await submit(result.current.handleSubmit, { body: "hi", website: "" });

    expect(mocks.postThread).not.toHaveBeenCalled();
    expect(result.current.status).toMatchObject({
      kind: "error",
      message: askMessages.invalid,
    });
    expect(result.current.bodyError).toBeTruthy();
    expect(result.current.summary).toBeNull();
  });

  it("files a visitor thread as pending and remembers the name", async () => {
    mocks.postThread.mockResolvedValue({
      ok: true,
      slug: "hello",
      status: "pending",
    });
    const onSent = vi.fn();
    const { result } = renderHook(() => useAskComposer({ onSent }));
    await submit(result.current.handleSubmit, {
      body: "A proper question here",
      name: " Alex ",
      website: "",
    });

    expect(mocks.postThread).toHaveBeenCalledWith(
      expect.objectContaining({ body: "A proper question here", name: "Alex" })
    );
    expect(localStorage.getItem(NAME_KEY)).toBe("Alex");
    expect(JSON.parse(localStorage.getItem(PENDING_KEY)!)[0]).toMatchObject({
      slug: "hello",
      authorName: "Alex",
    });
    expect(result.current.status).toEqual({ kind: "sent", status: "pending" });
    expect(result.current.justFiled).toBe(true);
    expect(onSent).toHaveBeenCalledWith("pending");
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("publishes an owner reply and refreshes, without a name", async () => {
    mocks.owner = true;
    mocks.postReply.mockResolvedValue({
      ok: true,
      slug: "t",
      status: "published",
    });
    const { result } = renderHook(() => useAskComposer({ slug: "t" }));
    expect(result.current.isReply).toBe(true);
    await submit(result.current.handleSubmit, {
      body: "Thanks for asking this",
      name: "Ignored",
      website: "",
    });

    expect(mocks.postReply).toHaveBeenCalledWith(
      "t",
      expect.not.objectContaining({ name: expect.anything() })
    );
    expect(mocks.refresh).toHaveBeenCalled();
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });

  it("shows the server's error and field errors", async () => {
    mocks.postThread.mockResolvedValue({
      ok: false,
      message: "Too many messages.",
    });
    const { result } = renderHook(() => useAskComposer({}));
    await submit(result.current.handleSubmit, {
      body: "A proper question here",
      website: "",
    });

    expect(result.current.status).toEqual({
      kind: "error",
      message: "Too many messages.",
      fieldErrors: {},
    });
    expect(result.current.summary).toBe("Too many messages.");
  });

  it("collapses on Escape when empty and collapsible", () => {
    const { result } = renderHook(() => useAskComposer({ collapsible: true }));
    act(() => result.current.setExpanded(true));
    const preventDefault = vi.fn();
    act(() =>
      result.current.handleKeyDown({
        key: "Escape",
        preventDefault,
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>)
    );
    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.expanded).toBe(false);
  });
});
