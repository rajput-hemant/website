/**
 * Build-time performance budget for prerendered pages.
 *
 * For every static HTML shell under `.next/server/app/**\/*.html` this adds
 * up the gzipped size of every `<script src="/_next/...">` it references
 * (the JS the browser must fetch before the page can hydrate) and counts its
 * `<link rel="preload" as="font">` tags, then checks both against a budget.
 *
 * Ceilings were set by building the site once (fallback content, no Sanity
 * env vars, the same conditions CI builds under) and rounding the measured
 * total up to the next 5KB plus 10KB of headroom. React plus the Next
 * runtime alone is already ~136KB gzipped, so the original 120KB target
 * isn't reachable; a text page is capped at 180KB and /ask at 240KB
 * regardless of measurement, and a page already over its cap fails rather
 * than raising it.
 *
 * Only initial chunks count. The motion and pointer stack (Lenis, the GSAP
 * ticker, InteractionLayer, the cursor, click sound, link previews) and the
 * ⌘K dialog load after idle through components/site/deferred-shell.tsx, so
 * they must never show up here; if they do, something imported them eagerly.
 *
 *   next build && bun run budget
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";

// --- Config ------------------------------------------------------------

/**
 * Per-route ceilings for the text pages, in KB gzipped. One entry per M1
 * static route (see docs/plan.md section 2.1).
 */
const TEXT_PAGE_CEILINGS_KB: Record<string, number> = {
  "/": 180,
  "/projects": 180,
  "/work": 180,
  "/about": 180,
  "/now": 180,
  "/resume": 180,
  "/lab": 180,
  "/ask": 240,
  "/owner": 180,
};

/**
 * `/ask/[slug]` and `/ask/page/[page]` aren't prerendered without Sanity
 * configured (and don't exist yet in this build), so there's nothing to
 * measure them against. This ceiling applies once those pages return.
 */
const ASK_WILDCARD_CEILING_KB = 240;

/** `/lab/*` experiment pages (three.js) are exempt from the text budget. */
const LAB_EXPERIMENT_CEILING_KB = 170;

const MAX_FONT_PRELOADS = 3;
const MAX_FONT_PRELOAD_KB = 120;

/** Hard caps: never raise a ceiling past these, no matter what's measured. */
const MAX_TEXT_PAGE_CEILING_KB = 180;
const MAX_ASK_CEILING_KB = 240;

for (const [route, kb] of Object.entries(TEXT_PAGE_CEILINGS_KB)) {
  const cap = route === "/ask" ? MAX_ASK_CEILING_KB : MAX_TEXT_PAGE_CEILING_KB;
  if (kb > cap) {
    throw new Error(
      `Budget config error: ${route} ceiling ${kb}KB exceeds the ${cap}KB cap.`
    );
  }
}
if (ASK_WILDCARD_CEILING_KB > MAX_ASK_CEILING_KB) {
  throw new Error(
    `Budget config error: /ask/* ceiling ${ASK_WILDCARD_CEILING_KB}KB exceeds the ${MAX_ASK_CEILING_KB}KB cap.`
  );
}

// --- Types ---------------------------------------------------------------

export type BudgetConfig = {
  textPageCeilingsKB: Record<string, number>;
  askWildcardCeilingKB: number;
  labExperimentCeilingKB: number;
  maxFontPreloads: number;
  maxFontPreloadKB: number;
};

export const defaultConfig: BudgetConfig = {
  textPageCeilingsKB: TEXT_PAGE_CEILINGS_KB,
  askWildcardCeilingKB: ASK_WILDCARD_CEILING_KB,
  labExperimentCeilingKB: LAB_EXPERIMENT_CEILING_KB,
  maxFontPreloads: MAX_FONT_PRELOADS,
  maxFontPreloadKB: MAX_FONT_PRELOAD_KB,
};

/** Reads the build output. The real implementation lives in {@link nodeFileSystem}. */
export type FileSystemAdapter = {
  /** Every prerendered page shell, as paths relative to `.next/server/app` (e.g. `/index.html`, `/lab/signature-field.html`). */
  listPageFiles(): string[];
  /** The HTML contents of one file returned by {@link listPageFiles}. */
  readHtml(pageFile: string): string;
  /** Gzip (level 9) size in bytes of the static asset a `/_next/...` URL points at. */
  gzipSizeOf(assetUrl: string): number;
};

type Category = "text" | "lab-experiment" | "unknown";

export type PageRow = {
  route: string;
  category: Category;
  totalKB: number;
  pageSpecificKB: number;
  frameworkKB: number;
  fontPreloads: number;
  ceilingKB: number | null;
  status: "OK" | "FAIL" | "UNCHECKED";
  reasons: string[];
};

export type BudgetReport = {
  rows: PageRow[];
  frameworkKB: number;
  frameworkChunks: string[];
  ok: boolean;
};

// --- Pure logic ------------------------------------------------------------

/** Files that are never a page to budget: the studio, error boundaries and the 404 shell. */
function isSkippedFile(relativePath: string): boolean {
  return (
    relativePath.includes("/studio") ||
    relativePath.includes("_not-found") ||
    relativePath.includes("_global-error")
  );
}

function routeFromFile(relativePath: string): string {
  const withoutExt = relativePath.replace(/\.html$/, "");
  return withoutExt === "/index" ? "/" : withoutExt;
}

const SCRIPT_TAG_RE = /<script[^>]*\ssrc="(\/_next\/[^"]+)"[^>]*>/g;
const FONT_PRELOAD_RE = /<link[^>]*\brel="preload"[^>]*\bas="font"[^>]*>/g;

function extractScriptSrcs(html: string): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const match of html.matchAll(SCRIPT_TAG_RE)) {
    const tag = match[0];
    const src = match[1];
    if (!src || tag.includes("noModule")) continue;
    if (seen.has(src)) continue;
    seen.add(src);
    ordered.push(src);
  }
  return ordered;
}

function fontPreloadHrefs(html: string): string[] {
  return [...html.matchAll(FONT_PRELOAD_RE)].map(
    (match) => /\bhref="([^"]+)"/.exec(match[0])?.[1] ?? ""
  );
}

function classify(
  route: string,
  config: BudgetConfig
): { category: Category; ceilingKB: number | null } {
  const textCeiling = config.textPageCeilingsKB[route];
  if (textCeiling !== undefined) {
    return { category: "text", ceilingKB: textCeiling };
  }
  if (route.startsWith("/ask/")) {
    return { category: "text", ceilingKB: config.askWildcardCeilingKB };
  }
  if (route.startsWith("/projects/")) {
    return { category: "text", ceilingKB: MAX_TEXT_PAGE_CEILING_KB };
  }
  if (route.startsWith("/lab/")) {
    return {
      category: "lab-experiment",
      ceilingKB: config.labExperimentCeilingKB,
    };
  }
  return { category: "unknown", ceilingKB: null };
}

/**
 * Evaluates the performance budget against a build's static output.
 * Pure over the adapter: same adapter answers in, same report out.
 */
export function evaluateBudget(
  fs: FileSystemAdapter,
  config: BudgetConfig = defaultConfig
): BudgetReport {
  const pages = fs
    .listPageFiles()
    .filter((file) => !isSkippedFile(file))
    .map((file) => ({
      route: routeFromFile(file),
      scripts: extractScriptSrcs(fs.readHtml(file)),
      fonts: fontPreloadHrefs(fs.readHtml(file)),
    }))
    .sort((a, b) => a.route.localeCompare(b.route));

  // The framework share is whatever every single page loads in common.
  let frameworkChunks = pages[0]
    ? new Set(pages[0].scripts)
    : new Set<string>();
  for (const page of pages.slice(1)) {
    const scripts = new Set(page.scripts);
    frameworkChunks = new Set(
      [...frameworkChunks].filter((chunk) => scripts.has(chunk))
    );
  }

  const sizeCache = new Map<string, number>();
  const gzipKB = (assetUrl: string): number => {
    let bytes = sizeCache.get(assetUrl);
    if (bytes === undefined) {
      bytes = fs.gzipSizeOf(assetUrl);
      sizeCache.set(assetUrl, bytes);
    }
    return bytes / 1024;
  };

  const frameworkKB = [...frameworkChunks].reduce(
    (sum, chunk) => sum + gzipKB(chunk),
    0
  );

  const rows: PageRow[] = pages.map(({ route, scripts, fonts }) => {
    const fontPreloads = fonts.length;
    // woff2 is already compressed, so its gzip size is its transfer size.
    const fontKB = fonts
      .filter((href) => href.startsWith("/_next/"))
      .reduce((sum, href) => sum + gzipKB(href), 0);
    const totalKB = scripts.reduce((sum, chunk) => sum + gzipKB(chunk), 0);
    const pageSpecificKB = scripts
      .filter((chunk) => !frameworkChunks.has(chunk))
      .reduce((sum, chunk) => sum + gzipKB(chunk), 0);
    const { category, ceilingKB } = classify(route, config);

    const reasons: string[] = [];
    if (ceilingKB !== null && totalKB > ceilingKB) {
      reasons.push(
        `${totalKB.toFixed(1)}KB exceeds the ${ceilingKB}KB ceiling`
      );
    }
    if (fontPreloads > config.maxFontPreloads) {
      reasons.push(
        `${fontPreloads} font preloads exceeds the ${config.maxFontPreloads} limit`
      );
    }
    if (fontKB > config.maxFontPreloadKB) {
      reasons.push(
        `${fontKB.toFixed(1)}KB of preloaded fonts exceeds the ${config.maxFontPreloadKB}KB limit`
      );
    }

    return {
      route,
      category,
      totalKB,
      pageSpecificKB,
      frameworkKB,
      fontPreloads,
      ceilingKB,
      status:
        category === "unknown"
          ? "UNCHECKED"
          : reasons.length > 0
            ? "FAIL"
            : "OK",
      reasons,
    };
  });

  return {
    rows,
    frameworkKB,
    frameworkChunks: [...frameworkChunks].sort(),
    ok: rows.every((row) => row.status !== "FAIL"),
  };
}

// --- Reporting -------------------------------------------------------------

export function formatReport(report: BudgetReport): string {
  const header = [
    "Route",
    "Total KB",
    "Page KB",
    "Ceiling KB",
    "Fonts",
    "Status",
  ];
  const lines = report.rows.map((row) => [
    row.route,
    row.totalKB.toFixed(1),
    row.pageSpecificKB.toFixed(1),
    row.ceilingKB === null ? "-" : String(row.ceilingKB),
    String(row.fontPreloads),
    row.status,
  ]);
  const widths = header.map((title, i) =>
    Math.max(title.length, ...lines.map((line) => line[i]?.length ?? 0))
  );
  const pad = (cell: string, i: number) => cell.padEnd(widths[i] ?? 0);
  const rule = widths.map((w) => "-".repeat(w)).join("-+-");

  const table = [
    header.map(pad).join(" | "),
    rule,
    ...lines.map((line) => line.map(pad).join(" | ")),
  ].join("\n");

  const failures = report.rows.filter((row) => row.status === "FAIL");
  const details = failures.length
    ? "\n\nViolations:\n" +
      failures
        .map((row) => `  ${row.route}: ${row.reasons.join("; ")}`)
        .join("\n")
    : "";

  return (
    table +
    `\n\nFramework share (shared by every page): ${report.frameworkKB.toFixed(1)}KB gzipped` +
    details
  );
}

// --- Real adapter ------------------------------------------------------------

function walkHtmlFiles(dir: string, root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkHtmlFiles(full, root));
    } else if (entry.name.endsWith(".html")) {
      out.push("/" + relative(root, full).split(sep).join("/"));
    }
  }
  return out;
}

export function nodeFileSystem(nextDir = ".next"): FileSystemAdapter {
  const appDir = join(nextDir, "server", "app");
  return {
    listPageFiles(): string[] {
      return walkHtmlFiles(appDir, appDir);
    },
    readHtml(pageFile: string): string {
      return readFileSync(
        join(appDir, ...pageFile.split("/").filter(Boolean)),
        "utf8"
      );
    },
    gzipSizeOf(assetUrl: string): number {
      const relativeUrl = assetUrl.replace(/^\/_next\//, "");
      const filePath = join(nextDir, relativeUrl);
      // Turbopack chunk paths are content-hashed, so a missing file means
      // the config drifted from the build, not a transient issue.
      statSync(filePath);
      return gzipSync(readFileSync(filePath), { level: 9 }).length;
    },
  };
}

// --- CLI ---------------------------------------------------------------

if (import.meta.main) {
  try {
    const report = evaluateBudget(nodeFileSystem());
    console.log(formatReport(report));
    if (!report.ok) {
      console.error("\nPerformance budget check failed.");
      process.exit(1);
    }
  } catch (error) {
    console.error(
      error instanceof Error && error.message.includes("ENOENT")
        ? `Could not read the build output. Run \`next build\` first.\n${error.message}`
        : error
    );
    process.exit(1);
  }
}
