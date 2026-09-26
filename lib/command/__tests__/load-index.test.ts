import { afterEach, describe, expect, it, vi } from "vitest";

import {
  loadOwnerSession,
  loadSearchIndex,
  resetCommandRequests,
} from "../load-index";

const index = { email: "a@b.dev", entries: [] };

afterEach(() => {
  resetCommandRequests();
  vi.unstubAllGlobals();
});

describe("loadSearchIndex", () => {
  it("fetches once and shares the result", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(index)));
    vi.stubGlobal("fetch", fetch);
    await expect(loadSearchIndex()).resolves.toEqual(index);
    await expect(loadSearchIndex()).resolves.toEqual(index);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries on the next call after a failure", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response("nope", { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(index)));
    vi.stubGlobal("fetch", fetch);
    await expect(loadSearchIndex()).rejects.toThrow("search.json: 500");
    await expect(loadSearchIndex()).resolves.toEqual(index);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe("loadOwnerSession", () => {
  it("reads the owner flag", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ owner: true })))
    );
    await expect(loadOwnerSession()).resolves.toBe(true);
  });

  it("treats errors and odd bodies as not the owner", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(loadOwnerSession()).resolves.toBe(false);
    resetCommandRequests();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ owner: "yes" })))
    );
    await expect(loadOwnerSession()).resolves.toBe(false);
  });
});
