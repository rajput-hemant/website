/**
 * Fails when the owner name or handle appears outside content/fallback, docs,
 * tests, and repository metadata.
 *
 *   bun scripts/check-identity.ts
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { site } from "../content/site";

export type IdentityViolation = {
  file: string;
  line: number;
  text: string;
  match: string;
};

const BINARY_EXTENSIONS = new Set([
  "ttf",
  "woff",
  "woff2",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "ico",
  "webp",
  "pdf",
]);

/** Paths permitted to name the owner or handle directly. */
export function isAllowedPath(path: string): boolean {
  const normalized = path.replaceAll("\\", "/");

  // Content & fallbacks
  if (normalized.startsWith("content/")) return true;

  // Documentation
  if (normalized.startsWith("docs/") || normalized.endsWith(".md")) return true;

  // Tests & test fixtures
  if (
    normalized.includes("/__tests__/") ||
    normalized.endsWith(".test.ts") ||
    normalized.endsWith(".test.tsx") ||
    normalized.endsWith(".spec.ts") ||
    normalized.endsWith(".spec.tsx") ||
    normalized.startsWith("e2e/")
  ) {
    return true;
  }

  // Repository metadata and tool configurations
  if (
    normalized === "package.json" ||
    normalized === "bun.lock" ||
    normalized === "LICENSE" ||
    normalized === "renovate.json" ||
    normalized === ".gitignore" ||
    normalized === ".gitattributes" ||
    normalized === ".editorconfig" ||
    normalized === "tsconfig.json" ||
    normalized === "AGENTS.md" ||
    normalized === "CLAUDE.md" ||
    normalized.startsWith(".github/") ||
    normalized.startsWith(".husky/")
  ) {
    return true;
  }

  return false;
}

export function findIdentityViolations(
  files?: readonly string[]
): IdentityViolation[] {
  const trackedFiles =
    files ??
    execSync("git ls-files", { encoding: "utf-8" })
      .trim()
      .split("\n")
      .filter(Boolean);

  const patterns: readonly RegExp[] = [
    new RegExp(site.name, "i"),
    new RegExp(site.handle, "i"),
    new RegExp(site.shortName, "i"),
    /\brajput\b/i,
  ];

  const violations: IdentityViolation[] = [];

  for (const file of trackedFiles) {
    if (isAllowedPath(file)) continue;

    const ext = file.split(".").pop()?.toLowerCase();
    if (ext && BINARY_EXTENSIONS.has(ext)) continue;

    let content: string;
    try {
      content = readFileSync(file, "utf-8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;
      for (const pattern of patterns) {
        const match = pattern.exec(line);
        if (match) {
          violations.push({
            file,
            line: i + 1,
            text: line.trim(),
            match: match[0],
          });
          break;
        }
      }
    }
  }

  return violations;
}

export function checkIdentity(): boolean {
  const violations = findIdentityViolations();
  if (violations.length === 0) {
    console.log("✓ check-identity: No hardcoded identity leaks found.");
    return true;
  }

  console.error(
    `Found ${violations.length} identity leak(s) outside allowed locations:`
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} (${v.match}): ${v.text}`);
  }
  return false;
}

if (import.meta.main) {
  const ok = checkIdentity();
  if (!ok) {
    process.exit(1);
  }
}
