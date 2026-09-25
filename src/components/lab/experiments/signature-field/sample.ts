const MAX_PARTICLES = 14000;
const DENSITY = 0.06;
const MIN_STEP = 1.2;

export type Field = {
  positions: Float32Array;
  seeds: Float32Array;
  step: number;
};

function random(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Draws each word where the plain wordmark laid it out, then samples the ink on a jittered grid.
export function sampleWordmark(wordmark: HTMLElement, stage: DOMRect): Field {
  const width = Math.round(stage.width);
  const height = Math.round(stage.height);
  const context = document
    .createElement('canvas')
    .getContext('2d', { willReadFrequently: true });
  if (!context || !width || !height) {
    return {
      positions: new Float32Array(),
      seeds: new Float32Array(),
      step: 1,
    };
  }

  context.canvas.width = width;
  context.canvas.height = height;
  const style = getComputedStyle(wordmark);
  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  context.letterSpacing = style.letterSpacing;
  context.fillStyle = '#fff';

  for (const word of wordmark.querySelectorAll<HTMLElement>('[data-word]')) {
    const box = word.getBoundingClientRect();
    const metrics = context.measureText(word.textContent);
    const ascent = metrics.fontBoundingBoxAscent;
    const content = ascent + metrics.fontBoundingBoxDescent;
    const baseline = box.top - stage.top + (box.height - content) / 2 + ascent;
    context.fillText(word.textContent, box.left - stage.left, baseline);
  }

  const { data } = context.getImageData(0, 0, width, height);
  let ink = 0;
  for (let index = 3; index < data.length; index += 4) {
    if ((data[index] ?? 0) > 127) ink += 1;
  }

  const target = Math.min(MAX_PARTICLES, width * height * DENSITY);
  const step = Math.max(MIN_STEP, Math.sqrt(ink / target));
  const next = random(width * 7919 + height);
  const positions: number[] = [];
  const seeds: number[] = [];

  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const px = x + (next() - 0.5) * step * 0.6;
      const py = y + (next() - 0.5) * step * 0.6;
      const alpha = data[(Math.floor(py) * width + Math.floor(px)) * 4 + 3];
      if ((alpha ?? 0) <= 127) continue;
      positions.push(px - width / 2, height / 2 - py, 0);
      seeds.push(next(), next(), next(), next());
    }
  }

  return {
    positions: new Float32Array(positions),
    seeds: new Float32Array(seeds),
    step,
  };
}
