import { describe, expect, it } from "vitest";

import {
  evaluateBudget,
  formatReport,
  type BudgetConfig,
  type FileSystemAdapter,
} from "../check-budget";

const config: BudgetConfig = {
  textPageCeilingsKB: { "/": 100, "/work": 90 },
  askWildcardCeilingKB: 150,
  labExperimentCeilingKB: 80,
  maxFontPreloads: 3,
  maxFontPreloadKB: 120,
};

/** Builds a fake adapter from `{ route: { scripts, fontPreloads } }` plus asset sizes in KB. */
function fakeFileSystem(
  pages: Record<string, { scripts: string[]; fonts?: number }>,
  assetSizesKB: Record<string, number>
): FileSystemAdapter {
  const fontTags = (n: number) =>
    Array.from(
      { length: n },
      () => `<link rel="preload" href="/x.woff2" as="font" crossorigin="">`
    ).join("");
  return {
    listPageFiles: () =>
      Object.keys(pages).map((route) =>
        route === "/" ? "/index.html" : `${route}.html`
      ),
    readHtml: (file) => {
      const route = file === "/index.html" ? "/" : file.replace(/\.html$/, "");
      const page = pages[route];
      if (!page) throw new Error(`no fixture for ${route}`);
      const scripts = page.scripts
        .map((src) => `<script src="${src}" async=""></script>`)
        .join("");
      return `<html><head>${fontTags(page.fonts ?? 0)}${scripts}</head></html>`;
    },
    gzipSizeOf: (assetUrl) => {
      const kb = assetSizesKB[assetUrl];
      if (kb === undefined) throw new Error(`no fixture size for ${assetUrl}`);
      return kb * 1024;
    },
  };
}

describe("evaluateBudget", () => {
  it("passes a page under its ceiling and separates the framework share", () => {
    const fs = fakeFileSystem(
      {
        "/": {
          scripts: [
            "/_next/static/chunks/fw.js",
            "/_next/static/chunks/home.js",
          ],
          fonts: 2,
        },
        "/work": {
          scripts: [
            "/_next/static/chunks/fw.js",
            "/_next/static/chunks/work.js",
          ],
          fonts: 2,
        },
      },
      {
        "/_next/static/chunks/fw.js": 50,
        "/_next/static/chunks/home.js": 10,
        "/_next/static/chunks/work.js": 5,
      }
    );

    const report = evaluateBudget(fs, config);
    expect(report.ok).toBe(true);
    expect(report.frameworkKB).toBeCloseTo(50);

    const home = report.rows.find((r) => r.route === "/");
    expect(home?.totalKB).toBeCloseTo(60);
    expect(home?.pageSpecificKB).toBeCloseTo(10);
    expect(home?.status).toBe("OK");
  });

  it("fails a page over its ceiling and reports why", () => {
    const fs = fakeFileSystem(
      { "/": { scripts: ["/_next/static/chunks/big.js"], fonts: 0 } },
      { "/_next/static/chunks/big.js": 500 }
    );

    const report = evaluateBudget(fs, config);
    expect(report.ok).toBe(false);
    expect(report.rows[0]?.status).toBe("FAIL");
    expect(report.rows[0]?.reasons[0]).toContain("exceeds the 100KB ceiling");
  });

  it("fails a page with too many font preloads", () => {
    const fs = fakeFileSystem({ "/": { scripts: [], fonts: 4 } }, {});

    const report = evaluateBudget(fs, config);
    expect(report.ok).toBe(false);
    expect(report.rows[0]?.reasons[0]).toContain("4 font preloads");
  });

  it("budgets an edition's page against its public route", () => {
    const fs = fakeFileSystem(
      { "/f/minimal/work": { scripts: ["/_next/static/chunks/big.js"] } },
      { "/_next/static/chunks/big.js": 95 }
    );

    const report = evaluateBudget(fs, config);
    expect(report.rows[0]?.route).toBe("/f/minimal/work");
    expect(report.rows[0]?.ceilingKB).toBe(90);
    expect(report.ok).toBe(false);
  });

  it("fails a page whose preloaded fonts are too heavy", () => {
    const font = "/_next/static/media/a.woff2";
    const fs: FileSystemAdapter = {
      listPageFiles: () => ["/index.html"],
      readHtml: () =>
        `<link rel="preload" href="${font}" as="font" crossorigin="">`,
      gzipSizeOf: () => 130 * 1024,
    };

    const report = evaluateBudget(fs, config);
    expect(report.ok).toBe(false);
    expect(report.rows[0]?.reasons[0]).toContain("of preloaded fonts");
  });

  it("excludes noModule polyfills and dedupes repeated scripts", () => {
    const legacy: FileSystemAdapter = {
      listPageFiles: () => ["/index.html"],
      readHtml: () =>
        `<html><head>
          <script src="/_next/static/chunks/a.js" async=""></script>
          <script src="/_next/static/chunks/a.js" async=""></script>
          <script src="/_next/static/chunks/polyfill.js" noModule=""></script>
        </head></html>`,
      gzipSizeOf: (assetUrl) =>
        assetUrl.includes("polyfill") ? 999 * 1024 : 5 * 1024,
    };

    const report = evaluateBudget(legacy, config);
    expect(report.rows[0]?.totalKB).toBeCloseTo(5);
  });

  it("routes /lab/* to the looser experiment ceiling and /ask/* to the ask ceiling", () => {
    const fs = fakeFileSystem(
      {
        "/lab/three-thing": {
          scripts: ["/_next/static/chunks/lab.js"],
          fonts: 0,
        },
        "/ask/some-question": {
          scripts: ["/_next/static/chunks/ask.js"],
          fonts: 0,
        },
      },
      {
        "/_next/static/chunks/lab.js": 90,
        "/_next/static/chunks/ask.js": 90,
      }
    );

    const report = evaluateBudget(fs, config);
    const lab = report.rows.find((r) => r.route === "/lab/three-thing");
    const ask = report.rows.find((r) => r.route === "/ask/some-question");
    expect(lab?.ceilingKB).toBe(80);
    expect(lab?.status).toBe("FAIL");
    expect(ask?.ceilingKB).toBe(150);
    expect(ask?.status).toBe("OK");
  });

  it("skips studio, _not-found and _global-error", () => {
    const fs: FileSystemAdapter = {
      listPageFiles: () => [
        "/studio/[[...tool]].html",
        "/_not-found.html",
        "/_global-error.html",
        "/index.html",
      ],
      readHtml: () => `<html><head></head></html>`,
      gzipSizeOf: () => 0,
    };
    const report = evaluateBudget(fs, config);
    expect(report.rows.map((r) => r.route)).toEqual(["/"]);
  });

  it("marks an unrecognised route as unchecked rather than failing", () => {
    const fs = fakeFileSystem({ "/surprise": { scripts: [], fonts: 0 } }, {});
    const report = evaluateBudget(fs, config);
    expect(report.rows[0]?.status).toBe("UNCHECKED");
    expect(report.ok).toBe(true);
  });
});

describe("formatReport", () => {
  it("renders a table with the framework share and lists violations", () => {
    const fs = fakeFileSystem(
      { "/": { scripts: ["/_next/static/chunks/big.js"], fonts: 0 } },
      { "/_next/static/chunks/big.js": 500 }
    );
    const output = formatReport(evaluateBudget(fs, config));
    expect(output).toContain("Route");
    expect(output).toContain("Framework share");
    expect(output).toContain("Violations:");
  });
});
