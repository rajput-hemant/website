import { type SanityClient } from "next-sanity";
import { describe, expect, it, vi } from "vitest";

import { createSanityVisitStore } from "../store";

function fakeClient(visitorsAfter: number) {
  const patch = {
    setIfMissing: vi.fn(() => patch),
    inc: vi.fn(() => patch),
    set: vi.fn(() => patch),
  };
  const transaction = {
    createIfNotExists: vi.fn(() => transaction),
    patch: vi.fn((_id: string, build: (p: typeof patch) => unknown) => {
      build(patch);
      return transaction;
    }),
    commit: vi.fn(async () => [
      { _id: "siteStats", visitors: 0 },
      { _id: "siteStats", visitors: visitorsAfter },
    ]),
  };
  const client = {
    transaction: vi.fn(() => transaction),
    fetch: vi.fn(async () => null),
  };
  return { client, transaction, patch };
}

describe("createSanityVisitStore", () => {
  it("creates the singleton if needed and increments it atomically", async () => {
    const { client, transaction, patch } = fakeClient(7);
    const store = createSanityVisitStore(client as unknown as SanityClient);

    await expect(store.increment("2026-09-25T12:00:00.000Z")).resolves.toBe(7);
    expect(transaction.createIfNotExists).toHaveBeenCalledWith({
      _id: "siteStats",
      _type: "siteStats",
      visitors: 0,
    });
    expect(transaction.patch).toHaveBeenCalledWith(
      "siteStats",
      expect.any(Function)
    );
    expect(patch.setIfMissing).toHaveBeenCalledWith({ visitors: 0 });
    expect(patch.inc).toHaveBeenCalledWith({ visitors: 1 });
    expect(patch.set).toHaveBeenCalledWith({
      updatedAt: "2026-09-25T12:00:00.000Z",
    });
    expect(transaction.commit).toHaveBeenCalledWith({ returnDocuments: true });
  });

  it("reads zero before the first visit", async () => {
    const { client } = fakeClient(0);
    const store = createSanityVisitStore(client as unknown as SanityClient);
    await expect(store.read()).resolves.toBe(0);
  });
});
