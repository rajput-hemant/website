import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("NEXT_PUBLIC_OWNER_BRANDING", () => {
  it("is off unless set to true", async () => {
    vi.stubEnv("NEXT_PUBLIC_OWNER_BRANDING", "");
    expect((await import("@/lib/env")).ownerBranding).toBe(false);
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_OWNER_BRANDING", "1");
    expect((await import("@/lib/env")).ownerBranding).toBe(false);
  });

  it("is on when set to true", async () => {
    vi.stubEnv("NEXT_PUBLIC_OWNER_BRANDING", "true");
    expect((await import("@/lib/env")).ownerBranding).toBe(true);
  });
});
