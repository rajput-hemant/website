import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

/** Loads the proxy with `NEXT_PUBLIC_FLAVOR` set as a build would inline it. */
async function loadProxy(flavor: string | undefined) {
  vi.stubEnv("NEXT_PUBLIC_FLAVOR", flavor);
  const { proxy } = await import("@/proxy");
  return (path: string, cookie?: string) =>
    proxy(
      new NextRequest(new URL(path, "https://example.test"), {
        headers: cookie ? { cookie: `hr_flavor=${cookie}` } : {},
      })
    );
}

const rewrittenTo = (response: Response) =>
  new URL(response.headers.get("x-middleware-rewrite") ?? "").pathname;

describe("proxy without a pinned edition", () => {
  it("shows the picker first and remembers ?flavor= in the cookie", async () => {
    const proxy = await loadProxy(undefined);

    expect(rewrittenTo(proxy("/"))).toBe("/flavors");
    expect(rewrittenTo(proxy("/", "press"))).toBe("/f/press");

    const switched = proxy("/work?flavor=press");
    expect(switched.status).toBe(307);
    expect(switched.headers.get("set-cookie")).toMatch(/^hr_flavor=press;/);
  });
});

describe("proxy with NEXT_PUBLIC_FLAVOR", () => {
  it("serves the pinned edition whatever the cookie says", async () => {
    const proxy = await loadProxy("press");

    expect(rewrittenTo(proxy("/"))).toBe("/f/press");
    expect(rewrittenTo(proxy("/", "minimal"))).toBe("/f/press");
    expect(rewrittenTo(proxy("/projects", "survey"))).toBe("/f/press/projects");
  });

  it("ignores ?flavor= and never sets the cookie", async () => {
    const proxy = await loadProxy("press");
    const response = proxy("/work?flavor=minimal");

    expect(rewrittenTo(response)).toBe("/f/press/work");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("sends the picker to the edition's 404 and other editions to the clean URL", async () => {
    const proxy = await loadProxy("press");

    expect(rewrittenTo(proxy("/flavors"))).toBe("/f/press/flavors");

    const moved = proxy("/f/minimal/projects?x=1");
    expect(moved.status).toBe(307);
    expect(moved.headers.get("location")).toBe(
      "https://example.test/projects?x=1"
    );
    expect(moved.headers.get("set-cookie")).toBeNull();
  });

  it("treats an empty value as unpinned", async () => {
    const proxy = await loadProxy("");

    expect(rewrittenTo(proxy("/"))).toBe("/flavors");
  });
});
