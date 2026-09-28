import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..", "..", "..");

/** Modules the /ask and /owner client components import. */
const clientEntries = ["client.ts", "fields.ts", "format.ts", "response.ts"];

/**
 * Specifiers of the imports that survive compilation. Under
 * verbatimModuleSyntax only `import type` / `export type` are erased;
 * `import { type X }` still loads the module for its side effects.
 */
function runtimeImports(source: string) {
  const pattern = /^(?:import|export)\s+(?!type\s)[^;]*?from\s+"([^"]+)"/gms;
  return Array.from(source.matchAll(pattern), (match) => match[1] ?? "");
}

function resolveLocal(from: string, specifier: string) {
  const base = specifier.startsWith("@/")
    ? join(root, specifier.slice(2))
    : join(dirname(from), specifier);
  return [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find((path) =>
    existsSync(path)
  );
}

/** Every package reached at runtime from `entry`, following local modules. */
function reachablePackages(entry: string) {
  const packages = new Set<string>();
  const seen = new Set<string>();
  const queue = [entry];
  for (let file = queue.pop(); file !== undefined; file = queue.pop()) {
    if (seen.has(file)) continue;
    seen.add(file);
    for (const specifier of runtimeImports(readFileSync(file, "utf8"))) {
      const isLocal = specifier.startsWith(".") || specifier.startsWith("@/");
      const local = isLocal ? resolveLocal(file, specifier) : undefined;
      if (local) queue.push(local);
      else packages.add(`${specifier} (via ${relative(root, file)})`);
    }
  }
  return [...packages];
}

describe("client-facing ask modules", () => {
  it.each(clientEntries)("%s never loads zod at runtime", (entry) => {
    const packages = reachablePackages(join(__dirname, "..", entry));
    expect(packages.filter((name) => /^(zod|@t3-oss\/)/.test(name))).toEqual(
      []
    );
  });
});
