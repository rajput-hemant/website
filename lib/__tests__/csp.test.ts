import { describe, expect, it } from "vitest";

import config from "../../next.config";

async function cspFor(proto?: string) {
  const rules = (await config.headers?.()) ?? [];
  const values = rules
    .filter((rule) =>
      proto
        ? rule.has?.some((h) => h.type === "header" && h.value === proto)
        : !rule.has
    )
    .flatMap((rule) => rule.headers)
    .filter((h) => h.key === "Content-Security-Policy")
    .map((h) => h.value);
  return values.at(-1) ?? "";
}

describe("Content-Security-Policy", () => {
  it("lets link previews show any https og:image", async () => {
    const img = (await cspFor())
      .split("; ")
      .find((d) => d.startsWith("img-src"));
    expect(img?.split(" ")).toEqual(
      expect.arrayContaining(["'self'", "data:", "https:"])
    );
  });

  it("keeps scripts and connections locked to the site", async () => {
    const csp = await cspFor();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toMatch(/script-src[^;]*https:/);
    expect(csp).not.toMatch(/connect-src[^;]*\shttps:(\s|;|$)/);
  });

  it("leaves next/image restricted to the Sanity CDN", () => {
    expect(config.images?.remotePatterns).toEqual([
      { protocol: "https", hostname: "cdn.sanity.io" },
    ]);
  });
});
