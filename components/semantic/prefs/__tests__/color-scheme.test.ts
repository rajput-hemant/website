import { readFileSync } from "node:fs";
import { liveFlavors } from "@/flavors/registry";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

describe("color-scheme pin", () => {
  it("pins color-scheme from data-theme in both directions", () => {
    const css = read("../color-scheme.css");
    for (const theme of ["light", "dark"]) {
      expect(css).toMatch(
        new RegExp(
          `:root\\[data-theme="${theme}"\\]\\s*{\\s*color-scheme:\\s*${theme};`
        )
      );
    }
  });

  it.each(liveFlavors)("is imported by the %s edition", (id) => {
    expect(read(`../../../../flavors/${id}/styles.css`)).toContain(
      '@import "../../components/semantic/prefs/color-scheme.css";'
    );
  });
});
