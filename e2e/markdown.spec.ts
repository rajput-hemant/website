import { expect, test } from "@playwright/test";

import { markdownPathFor, nav, pages } from "./support/site";

// Plain HTTP checks: the result is the same in every browser project.
test.skip(({ isMobile }) => isMobile, "HTTP only; covered by desktop");

test.describe("markdown mirrors", () => {
  for (const { path } of pages) {
    const mirror = markdownPathFor(path);

    test(`${mirror} is markdown with a top-level heading`, async ({
      request,
    }) => {
      const response = await request.get(mirror);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toMatch(/^text\/markdown/);
      const body = await response.text();
      expect(body.startsWith("# ")).toBe(true);
    });
  }

  test("the page URL negotiates markdown via Accept", async ({ request }) => {
    const response = await request.get("/work", {
      headers: { Accept: "text/markdown" },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^text\/markdown/);
    expect((await response.text()).startsWith("# ")).toBe(true);
  });

  test("a browser Accept header still gets HTML", async ({ request }) => {
    const response = await request.get("/work", {
      headers: {
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    });
    expect(response.headers()["content-type"]).toMatch(/^text\/html/);
  });

  test("unknown mirrors are 404", async ({ request }) => {
    const response = await request.get("/does-not-exist.md");
    expect(response.status()).toBe(404);
  });

  test("the footer links to the current page's mirror", async ({ page }) => {
    await page.goto("/work");
    await expect(
      page.getByRole("link", { name: "View as markdown" })
    ).toHaveAttribute("href", "/work.md");
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "View as markdown" })
    ).toHaveAttribute("href", "/index.md");
  });
});

test.describe("llms.txt", () => {
  test("indexes every page's markdown mirror", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^text\/plain/);
    const body = await response.text();
    expect(body.startsWith("# ")).toBe(true);

    const links = [...body.matchAll(/\]\(([^)\s]+\.md)\)/g)].map(
      (match) => new URL(match[1] ?? "", "http://x").pathname
    );
    for (const { path } of pages) {
      expect(links).toContain(markdownPathFor(path));
    }
  });
});

test.describe("sitemap.xml", () => {
  test("is a urlset with every page", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/xml/);
    const body = await response.text();
    expect(body).toMatch(/^<\?xml[^>]*\?>/);
    expect(body).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
    );

    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1] ?? "").pathname
    );
    for (const { path } of pages) expect(locs).toContain(path);
    for (const { href } of nav) expect(locs).toContain(href);
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs.some((loc) => loc.startsWith("/studio"))).toBe(false);
  });
});

test.describe("robots.txt", () => {
  test("allows the site, blocks private paths and points at the sitemap", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^text\/plain/);
    const body = await response.text();
    expect(body).toMatch(/^User-Agent: \*$/im);
    expect(body).toMatch(/^Allow: \/$/m);
    expect(body).toMatch(/^Disallow: \/studio$/m);
    expect(body).toMatch(/^Disallow: \/api\/$/m);
    expect(body).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m);
  });
});
