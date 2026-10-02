import { beforeEach, describe, expect, it, vi } from "vitest";

import { sanityFetch } from "../fetch";

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn().mockRejectedValue(new Error("outside a request")),
}));
vi.mock("../client", () => ({ client: { fetch: mocks.fetch } }));

beforeEach(() => mocks.fetch.mockReset());

describe("sanityFetch", () => {
  it("reads published content past the API CDN, cached under its tags", async () => {
    mocks.fetch.mockResolvedValue({});
    await sanityFetch({ query: "*", tags: ["question"] });
    expect(mocks.fetch).toHaveBeenCalledWith(
      "*",
      {},
      expect.objectContaining({
        useCdn: false,
        cache: "force-cache",
        next: { tags: ["question"] },
      })
    );
  });
});
