export type WordmarkSample = {
  count: number;
  /** Letter positions in word units (xyz), the word 1 wide and centred on the origin. */
  targets: Float32Array;
  /** Starting positions (xyz): a loose cloud around the word, spread in depth. */
  scatter: Float32Array;
  /** Per-particle randoms (xyzw) consumed by the vertex shader. */
  seeds: Float32Array;
  /** Height of the word's ink box divided by its width. */
  aspect: number;
  /** Average distance between neighbouring particles, in word units. */
  spacing: number;
};

type SampleOptions = {
  text: string;
  /** Expected on-screen width of the word, in CSS pixels. */
  wordWidthPx: number;
  /** Target distance between particles on screen, in CSS pixels. */
  spacingPx: number;
  fontFamily: string;
  fontWeight?: number;
};

/*
 * Fraunces picks its optical size from the font size, and at display sizes its
 * hairlines get too thin to hold particles. Setting the type at 72px (near the
 * wordmark's opsz) and scaling the context up keeps the sturdier cut.
 */
const FONT_PX = 72;
const RASTER_SCALE = 4;
const PADDING_PX = 8;
const ALPHA_THRESHOLD = 128;
const JITTER = 0.8;

function gaussian() {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

async function loadFont(font: string, text: string) {
  try {
    await document.fonts.load(font, text);
    await document.fonts.ready;
  } catch {
    // The canvas falls back to the next family in the stack.
  }
}

function rasterize(text: string, font: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas is unavailable");

  const setType = () => {
    context.font = font;
    context.letterSpacing = `${-0.015 * FONT_PX}px`;
  };
  setType();
  const metrics = context.measureText(text);
  const inkWidth =
    (metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) *
    RASTER_SCALE;
  const inkHeight =
    (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) *
    RASTER_SCALE;

  canvas.width = Math.ceil(inkWidth + PADDING_PX * 2);
  canvas.height = Math.ceil(inkHeight + PADDING_PX * 2);
  // Resizing a canvas resets its state.
  setType();
  context.translate(PADDING_PX, PADDING_PX);
  context.scale(RASTER_SCALE, RASTER_SCALE);
  context.fillText(
    text,
    metrics.actualBoundingBoxLeft,
    metrics.actualBoundingBoxAscent
  );

  const { data, width, height } = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  const isInk = (x: number, y: number) =>
    (data[(Math.round(y) * width + Math.round(x)) * 4 + 3] ?? 0) >
    ALPHA_THRESHOLD;

  return {
    isInk,
    hasInk: inkWidth > 0 && inkHeight > 0,
    width,
    height,
    inkWidth,
    inkHeight,
  };
}

/**
 * Draws `text` to an offscreen canvas in the given font and places points
 * inside the glyphs on a jittered grid, which reads as an even stipple rather
 * than the clumps of pure random sampling. Density follows the on-screen size.
 */
export async function sampleWordmark({
  text,
  wordWidthPx,
  spacingPx,
  fontFamily,
  fontWeight = 540,
}: SampleOptions): Promise<WordmarkSample> {
  const font = `${fontWeight} ${FONT_PX}px ${fontFamily}`;
  await loadFont(font, text);
  const { isInk, hasInk, width, height, inkWidth, inkHeight } = rasterize(
    text,
    font
  );
  if (!hasInk) throw new Error("No glyph pixels were sampled");

  const step = Math.max(1, (spacingPx * inkWidth) / wordWidthPx);
  const points: number[] = [];
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const px = x + (Math.random() - 0.5) * step * JITTER;
      const py = y + (Math.random() - 0.5) * step * JITTER;
      if (px < 0 || py < 0 || px >= width - 1 || py >= height - 1) continue;
      if (isInk(px, py)) points.push(px, py);
    }
  }

  const total = points.length / 2;
  const targets = new Float32Array(total * 3);
  const scatter = new Float32Array(total * 3);
  const seeds = new Float32Array(total * 4);

  for (let i = 0; i < total; i++) {
    const px = points[i * 2] ?? 0;
    const py = points[i * 2 + 1] ?? 0;
    targets[i * 3] = (px - width / 2) / inkWidth;
    targets[i * 3 + 1] = (height / 2 - py) / inkWidth;

    scatter[i * 3] = gaussian() * 0.5;
    scatter[i * 3 + 1] = gaussian() * 0.28;
    scatter[i * 3 + 2] = Math.min(0.4, Math.max(-1, gaussian() * 0.35));

    for (let k = 0; k < 4; k++) seeds[i * 4 + k] = Math.random();
  }

  return {
    count: total,
    targets,
    scatter,
    seeds,
    aspect: inkHeight / inkWidth,
    spacing: step / inkWidth,
  };
}
