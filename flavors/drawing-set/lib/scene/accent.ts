export type RGB = [number, number, number];
export type Palette = { ground: RGB; ink: RGB; accent: RGB };

const TOKENS = {
  ground: "--color-ground",
  ink: "--color-ink",
  accent: "--color-accent",
} as const;

let probe: HTMLSpanElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

export const toLinear = (byte: number) => {
  const c = byte / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/**
 * Any CSS colour (oklch, light-dark results, hex) to linear sRGB. The 2D
 * canvas does the parsing and gamut mapping, so no colour library is needed.
 */
export function cssToLinear(color: string): RGB {
  ctx ??= document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!ctx) return [0, 0, 0];
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [toLinear(r), toLinear(g), toLinear(b)];
}

/** Resolves the theme tokens through a hidden probe, so light-dark() and --accent-hue apply. */
export function readPalette(): Palette {
  if (!probe) {
    probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:fixed;visibility:hidden;pointer-events:none;inset:0 auto auto 0";
    document.body.append(probe);
  }
  const read = (token: string) => {
    probe!.style.color = `var(${token})`;
    return cssToLinear(getComputedStyle(probe!).color);
  };
  return {
    ground: read(TOKENS.ground),
    ink: read(TOKENS.ink),
    accent: read(TOKENS.accent),
  };
}

/** Calls `onChange` with the new palette when data-theme or the accent hue changes. */
export function watchPalette(onChange: (palette: Palette) => void) {
  let last = JSON.stringify(readPalette());
  const observer = new MutationObserver(() => {
    const next = readPalette();
    const key = JSON.stringify(next);
    if (key === last) return;
    last = key;
    onChange(next);
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "style"],
  });
  return () => observer.disconnect();
}
