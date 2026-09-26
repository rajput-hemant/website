import { afterEach, describe, expect, it, vi } from "vitest";

import { getOwnerSession, postThread } from "../client";
import { askMessages } from "../response";

const draft = { body: "Hello there", website: "", elapsed: 5000 };

function respond(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      typeof body === "string"
        ? new Response(body, { status })
        : Response.json(body, { status })
    )
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ask client", () => {
  it("turns a network failure into a readable error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("offline");
      })
    );
    expect(await postThread(draft)).toEqual({
      ok: false,
      status: 0,
      message: askMessages.failed,
    });
  });

  it("rejects a 2xx body that doesn't match the contract", async () => {
    respond(200, { ok: true, slug: 1 });
    expect(await postThread(draft)).toEqual({
      ok: false,
      status: 200,
      message: askMessages.failed,
    });
  });

  it("falls back to the status message for a non-JSON error body", async () => {
    respond(429, "<html>busy</html>");
    const result = await getOwnerSession();
    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toMatch(/Too many attempts/);
  });

  it("keeps the server's message and field errors", async () => {
    respond(400, {
      message: "Check the form.",
      fieldErrors: { body: ["Too short."] },
    });
    expect(await postThread(draft)).toEqual({
      ok: false,
      status: 400,
      message: "Check the form.",
      fieldErrors: { body: ["Too short."] },
    });
  });

  it("reads a successful post", async () => {
    respond(200, { ok: true, slug: "hello", status: "pending", key: "k1" });
    expect(await postThread(draft)).toEqual({
      ok: true,
      slug: "hello",
      status: "pending",
      key: "k1",
    });
  });
});
