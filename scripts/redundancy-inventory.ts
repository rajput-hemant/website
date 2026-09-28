/**
 * Regenerate docs/redundancy-inventory.tsv from the current tree.
 *
 *   bun scripts/redundancy-inventory.ts
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "docs/redundancy-inventory.tsv");
const EDITIONS = [
  "minimal",
  "drawing-set",
  "surface",
  "survey",
  "timetable",
  "press",
] as const;
const AUDIT_ROOTS = ["app/f", "flavors", "components/semantic", "lib"];

function walk(dir: string, files: string[]) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path, files);
      continue;
    }
    files.push(path);
  }
}

function rel(path: string): string {
  return relative(ROOT, path).replaceAll("\\", "/");
}

function normalizeEditionPath(path: string): string {
  let out = path;
  for (const edition of EDITIONS) {
    out = out.replace(`app/f/${edition}/`, "app/f/E/");
    out = out.replace(`flavors/${edition}/`, "flavors/E/");
  }
  return out;
}

function behaviorFamily(path: string): string {
  if (path.startsWith("app/f/")) {
    const rest = path.replace(/^app\/f\/[^/]+\//, "");
    if (
      rest === "page.tsx" ||
      rest === "layout.tsx" ||
      rest === "not-found.tsx"
    ) {
      return "route:home";
    }
    const route = rest.replace(/\/page\.tsx$/, "").replace(/\.tsx$/, "");
    return `route:${route}`;
  }
  if (path.startsWith("flavors/")) {
    const rest = path.replace(/^flavors\/[^/]+\//, "");
    const parts = rest.split("/");
    const family = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
    return `edition:${family}`;
  }
  if (path.startsWith("lib/")) {
    const rest = path.slice("lib/".length);
    const parts = rest.split("/");
    const family = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
    return `lib:${family}`;
  }
  if (path.startsWith("components/semantic/")) {
    const rest = path.slice("components/semantic/".length);
    const parts = rest.split("/");
    const family = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
    return `semantic:${family}`;
  }
  return "other";
}

function listPaths(): string[] {
  const files: string[] = [];
  for (const root of AUDIT_ROOTS) {
    walk(join(ROOT, root), files);
  }
  return files.map(rel).sort();
}

function joinList(paths: string[]): string {
  return paths.filter(Boolean).join("; ");
}

const paths = listPaths();
const byNormalized = new Map<string, string[]>();
const byBasename = new Map<string, string[]>();
const byHash = new Map<string, string[]>();

for (const path of paths) {
  const key = normalizeEditionPath(path);
  const normGroup = byNormalized.get(key) ?? [];
  normGroup.push(path);
  byNormalized.set(key, normGroup);

  const base = basename(path);
  const baseGroup = byBasename.get(base) ?? [];
  baseGroup.push(path);
  byBasename.set(base, baseGroup);

  const hash = createHash("sha256")
    .update(readFileSync(join(ROOT, path)))
    .digest("hex");
  const hashGroup = byHash.get(hash) ?? [];
  hashGroup.push(path);
  byHash.set(hash, hashGroup);
}

const lines = [
  "path\tbehavior family\tsame-relative-path peers\tsame-name candidates\texact-byte peers",
];

for (const path of paths) {
  const normKey = normalizeEditionPath(path);
  const relPeers = (byNormalized.get(normKey) ?? []).filter((p) => p !== path);
  const namePeers = (byBasename.get(basename(path)) ?? []).filter(
    (p) => p !== path
  );
  const hash = createHash("sha256")
    .update(readFileSync(join(ROOT, path)))
    .digest("hex");
  const bytePeers = (byHash.get(hash) ?? []).filter((p) => p !== path);

  lines.push(
    [
      path,
      behaviorFamily(path),
      joinList(relPeers),
      joinList(namePeers),
      joinList(bytePeers),
    ].join("\t")
  );
}

writeFileSync(OUT, `${lines.join("\n")}\n`);
console.log(`Wrote ${paths.length} rows to ${relative(ROOT, OUT)}`);
