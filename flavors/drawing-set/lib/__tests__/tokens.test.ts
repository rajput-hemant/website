import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../../styles.css", import.meta.url), "utf8");

function token(name: string): [string, string] {
  const match = css.match(
    new RegExp(
      `--color-${name}:\\s*light-dark\\(\\s*([^,]+?),\\s*([^;]+?)\\s*\\);`
    )
  );
  if (!match?.[1] || !match[2]) throw new Error(`missing --color-${name}`);
  return [match[1], match[2]];
}

function oklchParts(value: string): [number, number, number] {
  const [l = NaN, c = NaN, h = 0] = (value.match(/[\d.]+/g) ?? []).map(Number);
  return [l, c, h];
}

const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

type Rgb = [number, number, number];

function hexToLinear(hex: string): Rgb {
  const value = hex.replace("#", "");
  const channel = (i: number) =>
    srgbToLinear(parseInt(value.slice(i, i + 2), 16) / 255);
  return [channel(0), channel(2), channel(4)];
}

/** oklch to linear sRGB, clipped per channel (the harshest gamut mapping). */
function oklchToLinear(l: number, c: number, hue: number): Rgb {
  const a = c * Math.cos((hue * Math.PI) / 180);
  const b = c * Math.sin((hue * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clip = (channel: number) => Math.min(1, Math.max(0, channel));
  return [
    clip(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
    clip(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
    clip(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
  ];
}

const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function contrast(a: Rgb, b: Rgb) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const surfaces = ["ground", "sheet", "sheet-deep"];
const themes = [
  ["light", 0],
  ["dark", 1],
] as const;

describe("Drawing Set theme tokens", () => {
  it("pins color-scheme from data-theme in both directions", () => {
    for (const theme of ["light", "dark"]) {
      expect(css).toMatch(
        new RegExp(
          `:root\\[data-theme="${theme}"\\]\\s*{\\s*color-scheme:\\s*${theme};`
        )
      );
    }
  });

  for (const [theme, side] of themes) {
    it(`keeps every text ink at AA on every ${theme} surface`, () => {
      for (const ink of ["ink", "ink-soft", "ink-faint", "danger"]) {
        const value = token(ink)[side];
        const fg = value.startsWith("#")
          ? hexToLinear(value)
          : oklchToLinear(...oklchParts(value));
        for (const surface of surfaces) {
          const bg = hexToLinear(token(surface)[side]);
          expect(contrast(fg, bg), `${ink} on ${surface}`).toBeGreaterThan(4.5);
        }
      }
    });

    it(`keeps the accent at AA on every ${theme} surface at any hue`, () => {
      const [l, c] = oklchParts(token("accent")[side]);
      for (const surface of surfaces) {
        const bg = hexToLinear(token(surface)[side]);
        for (let hue = 0; hue < 360; hue++) {
          expect(
            contrast(oklchToLinear(l, c, hue), bg),
            `hue ${hue} on ${surface}`
          ).toBeGreaterThan(4.5);
        }
      }
    });
  }
});
