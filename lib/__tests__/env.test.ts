import { readFileSync } from "node:fs";
import { join } from "node:path";
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

  it("falls back when public values are unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", undefined);
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", undefined);

    const { env, isSanityConfigured } = await import("../env");

    expect(env.siteUrl).toBe("http://localhost:3000");
    expect(env.sanity.projectId).toBe("");
    expect(env.sanity.dataset).toBe("production");
    expect(isSanityConfigured).toBe(false);
  });

  it("strips a trailing slash from the site url", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");

    const { env } = await import("../env");

    expect(env.siteUrl).toBe("https://example.com");
  });
});

describe("public env validation", () => {
  it("validates the public variables on the server", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "abc123");

    const [{ env, isSanityConfigured }, { serverEnv }] = await Promise.all([
      import("../env"),
      import("../env.server"),
    ]);

    expect(serverEnv.NEXT_PUBLIC_SANITY_PROJECT_ID).toBe("abc123");
    expect(env.sanity.projectId).toBe("abc123");
    expect(isSanityConfigured).toBe(true);
  });

  it("keeps the client module free of validation code", () => {
    // env.ts is imported by client components; zod or T3Env there ships ~90KB gzipped.
    const source = readFileSync(join(__dirname, "..", "env.ts"), "utf8");

    expect(source).not.toMatch(/from\s+"(zod|@t3-oss\/[^"]+)"/);
  });
});

describe("NEXT_PUBLIC_FLAVOR", () => {
  it("leaves the edition unpinned when unset or empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_FLAVOR", "");

    const [{ env, isEditionPinned }, { serverEnv }, { pinnedFlavor }] =
      await Promise.all([
        import("../env"),
        import("../env.server"),
        import("@/flavors/registry"),
      ]);

    expect(env.pinnedFlavor).toBeUndefined();
    expect(isEditionPinned).toBe(false);
    expect(serverEnv.NEXT_PUBLIC_FLAVOR).toBe("");
    expect(pinnedFlavor).toBeUndefined();
  });

  it("pins a live edition", async () => {
    vi.stubEnv("NEXT_PUBLIC_FLAVOR", "press");

    const [{ isEditionPinned }, { serverEnv }, { pinnedFlavor, siteFlavor }] =
      await Promise.all([
        import("../env"),
        import("../env.server"),
        import("@/flavors/registry"),
      ]);

    expect(isEditionPinned).toBe(true);
    expect(serverEnv.NEXT_PUBLIC_FLAVOR).toBe("press");
    expect(pinnedFlavor).toBe("press");
    expect(siteFlavor).toBe("press");
  });

  it("fails validation with the list of live editions for anything else", async () => {
    vi.stubEnv("NEXT_PUBLIC_FLAVOR", "prss");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(import("../env.server")).rejects.toThrow(
      "Invalid environment variables"
    );
    expect(JSON.stringify(error.mock.calls)).toContain(
      "NEXT_PUBLIC_FLAVOR must be a live edition id (minimal, drawing-set"
    );
    error.mockRestore();
  });
});
