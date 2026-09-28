/**
 * Playwright screenshot harness for edition visual baselines.
 *
 *   bun scripts/visual-baseline.ts inventory --next-dir .next
 *   bun run start -p 3021 &
 *   bun scripts/visual-baseline.ts capture --base-url http://localhost:3021 --out ./shots --next-dir .next
 *   bun scripts/visual-baseline.ts compare --a ./shots-a --b ./shots-b
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import type { LiveFlavorId } from "@/flavors/registry";
import pixelmatch from "pixelmatch";
import { chromium, type Browser, type Page } from "playwright";
import { PNG } from "pngjs";

import { serverEnv } from "@/lib/env.server";

import {
  editionPrefs,
  prefsForVariant,
  VIEWPORTS,
  VISUAL_VARIANTS,
  type VisualVariant,
} from "./lib/visual-baseline/editions";
import {
  editionRoutesFromManifest,
  screenCount,
  type EditionRoute,
} from "./lib/visual-baseline/routes";

const DEFAULT_SETTLE_MS = 2_500;
const DEFAULT_THRESHOLD = 0.1;

function usage(): never {
  console.error(`Usage:
  visual-baseline inventory [--next-dir .next]
  visual-baseline capture --base-url <url> --out <dir> [--next-dir .next] [--settle-ms N] [--only flavor,path]
  visual-baseline compare --a <dir> --b <dir> [--threshold 0.1] [--write-diff <dir>]`);
  process.exit(1);
}

function routeSlug(path: string): string {
  if (path === "/") return "index";
  return path.replace(/^\//, "").replaceAll("/", "__");
}

function screenRelativePath(
  flavor: LiveFlavorId,
  width: string,
  variant: VisualVariant,
  path: string
): string {
  return join(flavor, width, variant, `${routeSlug(path)}.png`);
}

function screenId(
  flavor: LiveFlavorId,
  path: string,
  width: string,
  variant: VisualVariant
): string {
  return `${flavor} ${path} @${width} ${variant}`;
}

async function waitSettled(page: Page, settleMs: number) {
  await page.waitForLoadState("load");
  await page
    .waitForLoadState("networkidle", { timeout: 5_000 })
    .catch(() => undefined);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
  const hasCanvas = (await page.locator("canvas").count()) > 0;
  await page.waitForTimeout(hasCanvas ? settleMs * 2 : settleMs);
}

async function captureScreen(
  browser: Browser,
  baseUrl: string,
  route: EditionRoute,
  width: number,
  height: number,
  widthLabel: string,
  variant: VisualVariant,
  outFile: string,
  settleMs: number
) {
  const { storageKey } = editionPrefs[route.flavor];
  const prefs = prefsForVariant(route.flavor, variant);
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: variant === "reduced-motion" ? "reduce" : "no-preference",
    colorScheme: variant === "dark" ? "dark" : "light",
  });
  await context.addInitScript(
    ([key, stored]: [string, Record<string, unknown>]) => {
      window.localStorage.setItem(key, JSON.stringify(stored));
    },
    [storageKey, prefs] as [string, Record<string, unknown>]
  );
  const page = await context.newPage();
  const url = `${baseUrl.replace(/\/$/, "")}${route.urlPath}`;
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  if (!response || response.status() >= 400) {
    await context.close();
    throw new Error(`${url} returned ${response?.status() ?? "no response"}`);
  }
  await waitSettled(page, settleMs);
  mkdirSync(join(outFile, ".."), { recursive: true });
  await page.screenshot({
    path: outFile,
    fullPage: true,
    animations: "disabled",
  });
  await context.close();
  return screenId(route.flavor, route.path, widthLabel, variant);
}

function walkPngFiles(root: string): string[] {
  const files: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) break;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".png")) files.push(full);
    }
  }
  return files.sort();
}

function loadPng(path: string): PNG {
  return PNG.sync.read(readFileSync(path));
}

type CompareRow = {
  screen: string;
  status: "match" | "diff" | "missing";
  diffPixels: number;
  diffRatio: number;
};

function compareTrees(
  dirA: string,
  dirB: string,
  threshold: number,
  diffDir?: string
): CompareRow[] {
  const rootA = resolve(dirA);
  const rootB = resolve(dirB);
  const filesA = new Set(
    walkPngFiles(rootA).map((file) => relative(rootA, file))
  );
  const filesB = new Set(
    walkPngFiles(rootB).map((file) => relative(rootB, file))
  );
  const all = [...new Set([...filesA, ...filesB])].sort();
  const rows: CompareRow[] = [];

  for (const rel of all) {
    const inA = filesA.has(rel);
    const inB = filesB.has(rel);
    if (!inA || !inB) {
      rows.push({
        screen: rel.replace(/\.png$/, "").replaceAll("/", " "),
        status: "missing",
        diffPixels: 0,
        diffRatio: 1,
      });
      continue;
    }
    const imgA = loadPng(join(rootA, rel));
    const imgB = loadPng(join(rootB, rel));
    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
      rows.push({
        screen: rel.replace(/\.png$/, "").replaceAll("/", " "),
        status: "diff",
        diffPixels: imgA.width * imgA.height,
        diffRatio: 1,
      });
      continue;
    }
    const diff = new PNG({ width: imgA.width, height: imgA.height });
    const diffPixels = pixelmatch(
      imgA.data,
      imgB.data,
      diff.data,
      imgA.width,
      imgA.height,
      { threshold }
    );
    const ratio = diffPixels / (imgA.width * imgA.height);
    if (diffPixels > 0 && diffDir) {
      const out = join(diffDir, rel);
      mkdirSync(join(out, ".."), { recursive: true });
      writeFileSync(out, PNG.sync.write(diff));
    }
    rows.push({
      screen: rel.replace(/\.png$/, "").replaceAll("/", " "),
      status: ratio === 0 ? "match" : "diff",
      diffPixels,
      diffRatio: ratio,
    });
  }
  return rows;
}

function printCompareTable(rows: CompareRow[]) {
  const header = ["screen", "status", "diff_px", "diff_%"];
  const lines = [header.join("\t")];
  for (const row of rows) {
    lines.push(
      [
        row.screen,
        row.status,
        String(row.diffPixels),
        `${(row.diffRatio * 100).toFixed(3)}`,
      ].join("\t")
    );
  }
  console.log(lines.join("\n"));
  const diffs = rows.filter((row) => row.status !== "match").length;
  console.error(
    `\n${rows.length} screens: ${rows.length - diffs} match, ${diffs} differ or missing`
  );
  if (diffs > 0) process.exitCode = 1;
}

async function runCapture(args: ReturnType<typeof parseArgs>["values"]) {
  const baseUrl = args["base-url"];
  const out = args.out;
  const nextDir =
    typeof args["next-dir"] === "string" ? args["next-dir"] : ".next";
  const settleMs = Number(args["settle-ms"] ?? DEFAULT_SETTLE_MS);
  if (typeof baseUrl !== "string" || typeof out !== "string") usage();

  let routes = editionRoutesFromManifest(nextDir);
  const only = args.only;
  if (typeof only === "string") {
    const [flavor, path = "/"] = only.split(",", 2) as [LiveFlavorId, string];
    routes = routes.filter(
      (route) => route.flavor === flavor && route.path === path
    );
  }

  const outRoot = resolve(out);
  mkdirSync(outRoot, { recursive: true });
  writeFileSync(
    join(outRoot, "manifest.json"),
    JSON.stringify(
      {
        baseUrl,
        capturedAt: new Date().toISOString(),
        routes,
        viewports: VIEWPORTS.map((v) => v.label),
        variants: VISUAL_VARIANTS,
        settleMs,
      },
      null,
      2
    )
  );

  const executablePath = serverEnv.PLAYWRIGHT_CHROMIUM_PATH;
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath !== undefined && { executablePath }),
  });

  const total = routes.length * VIEWPORTS.length * VISUAL_VARIANTS.length;
  let done = 0;
  for (const route of routes) {
    for (const viewport of VIEWPORTS) {
      for (const variant of VISUAL_VARIANTS) {
        const rel = screenRelativePath(
          route.flavor,
          viewport.label,
          variant,
          route.path
        );
        const outFile = join(outRoot, rel);
        const id = await captureScreen(
          browser,
          baseUrl,
          route,
          viewport.width,
          viewport.height,
          viewport.label,
          variant,
          outFile,
          settleMs
        );
        done += 1;
        console.error(`[${done}/${total}] ${id}`);
      }
    }
  }
  await browser.close();
  console.error(`Wrote ${total} screenshots under ${outRoot}`);
}

function runInventory(nextDir: string) {
  const routes = editionRoutesFromManifest(nextDir);
  const perEdition = routes.reduce(
    (acc, route) => {
      acc[route.flavor] = (acc[route.flavor] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  console.log(
    JSON.stringify({ routeCount: routes.length, perEdition, routes }, null, 2)
  );
  console.error(
    `Screens per capture run: ${screenCount(routes.length)} (${routes.length} routes × 2 widths × 3 variants)`
  );
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      "base-url": { type: "string" },
      out: { type: "string" },
      "next-dir": { type: "string" },
      "settle-ms": { type: "string" },
      only: { type: "string" },
      a: { type: "string" },
      b: { type: "string" },
      threshold: { type: "string" },
      "write-diff": { type: "string" },
    },
  });
  const command = positionals[0];
  if (!command) usage();

  if (command === "inventory") {
    const nextDir =
      typeof values["next-dir"] === "string" ? values["next-dir"] : ".next";
    if (!statSync(nextDir, { throwIfNoEntry: false })?.isDirectory()) {
      console.error(
        `Missing build output at ${nextDir}; run next build first.`
      );
      process.exit(1);
    }
    runInventory(nextDir);
    return;
  }

  if (command === "compare") {
    const dirA = values.a;
    const dirB = values.b;
    if (typeof dirA !== "string" || typeof dirB !== "string") usage();
    const threshold = Number(values.threshold ?? DEFAULT_THRESHOLD);
    const rows = compareTrees(
      dirA,
      dirB,
      threshold,
      typeof values["write-diff"] === "string"
        ? values["write-diff"]
        : undefined
    );
    printCompareTable(rows);
    return;
  }

  if (command === "capture") {
    await runCapture(values);
    return;
  }

  usage();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
