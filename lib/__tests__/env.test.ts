import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("environment defaults", () => {
  it("keeps empty optional values empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("ASK_COOKIE_SECRET", "");

    const [{ env }, { serverEnv }] = await Promise.all([
      import("../env"),
      import("../env.server"),
    ]);

    expect(env.siteUrl).toBe("");
    expect(serverEnv.ASK_COOKIE_SECRET).toBe("");
  });
});
