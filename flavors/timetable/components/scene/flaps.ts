import { DRUM } from "@/flavors/timetable/lib/board";
import { MODULE_GAP, MODULE_ROWS } from "@/flavors/timetable/lib/scene/poses";
import {
  CanvasTexture,
  DoubleSide,
  FrontSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
} from "three";

/** Drum glyphs, then the same glyphs printed signal yellow. */
const N = DRUM.length;
const COLS = 16;
const ROWS = Math.ceil((N * 2) / COLS);
const GW = 96;
const GH = 144;

/** Glyph index for a character, yellow or not. Unknown characters are blank. */
export const glyphOf = (char: string, yellow: boolean) =>
  Math.max(0, DRUM.indexOf(char)) + (yellow ? N : 0);

/** The drum position a glyph is printed at, ignoring its ink. */
export const drumOf = (glyph: number) => glyph % N;

/** One flap on from `cur` towards `target`, printed in the target's ink. */
export const stepToward = (cur: number, target: number) =>
  drumOf(cur) === drumOf(target)
    ? target
    : (target >= N ? N : 0) + ((drumOf(cur) + 1) % N);

/** Every glyph on one canvas texture; `draw` again once the real font loads. */
export function createAtlas() {
  const canvas = document.createElement("canvas");
  canvas.width = COLS * GW;
  canvas.height = ROWS * GH;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const draw = (font: string) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGlyphs(ctx, font);
    texture.needsUpdate = true;
  };
  return { texture, draw };
}

function drawGlyphs(ctx: CanvasRenderingContext2D, font: string) {
  ctx.font = `700 ${GH * 0.62}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const ascent = ctx.measureText("H").actualBoundingBoxAscent;
  for (let k = 0; k < N * 2; k++) {
    const x = (k % COLS) * GW;
    const y = Math.floor(k / COLS) * GH;
    ctx.fillStyle = "#282f35";
    ctx.fillRect(x, y, GW, GH / 2);
    ctx.fillStyle = "#21272c";
    ctx.fillRect(x, y + GH / 2, GW, GH / 2);
    ctx.fillStyle = k >= N ? "#ffc20e" : "#f4f6f7";
    ctx.fillText(DRUM[k % N] ?? " ", x + GW / 2, y + GH / 2 + ascent / 2);
  }
}

const vertex = /* glsl */ `
  attribute vec3 aOffset;
  attribute vec2 aSize;
  attribute vec2 aGlyph;
  attribute float aAngle;
  uniform float uPart;
  varying vec2 vUv;
  varying float vShade;
  varying vec2 vGlyph;

  void main() {
    vec3 p = vec3(position.xy * aSize, 0.0);
    float c = cos(aAngle);
    float s = sin(aAngle);
    p = vec3(p.x, p.y * c, p.y * s + (uPart > 1.5 ? 0.012 : 0.004));
    vUv = uv;
    vGlyph = aGlyph;
    // Edge-on flaps catch less light; the lower card sits in the hinge's shadow.
    vShade = uPart > 1.5 ? 1.0 - 0.45 * abs(s) : 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p + aOffset, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform float uPart;
  uniform vec2 uGrid;
  varying vec2 vUv;
  varying float vShade;
  varying vec2 vGlyph;

  void main() {
    bool back = uPart > 1.5 && !gl_FrontFacing;
    float glyph = back ? vGlyph.y : vGlyph.x;
    float col = mod(glyph, uGrid.x);
    float row = floor(glyph / uGrid.x);
    float top = 1.0 - row / uGrid.y;
    float bottom = 1.0 - (row + 1.0) / uGrid.y;
    float mid = (top + bottom) * 0.5;
    float v;
    if (uPart < 0.5) v = mix(mid, top, vUv.y);
    else if (uPart < 1.5) v = mix(bottom, mid, vUv.y);
    else v = back ? mix(mid, bottom, vUv.y) : mix(mid, top, vUv.y);
    vec2 uv = vec2((col + vUv.x) / uGrid.x, v);
    vec3 color = texture2D(uAtlas, uv).rgb;
    float hinge = uPart > 0.5 && uPart < 1.5 ? smoothstep(0.0, 0.22, 1.0 - vUv.y) * 0.25 + 0.75 : 1.0;
    gl_FragColor = vec4(color * vShade * hinge, 1.0);
    #include <colorspace_fragment>
  }
`;

type Part = 0 | 1 | 2;

/** One half-card per module: a top half, a bottom half or the falling flap. */
function halfGeometry(part: Part, count: number) {
  const plane = new PlaneGeometry(1, 0.5 - 0.012);
  plane.translate(0, part === 1 ? -0.25 - 0.006 : 0.25 + 0.006, 0);
  const geometry = new InstancedBufferGeometry();
  geometry.index = plane.index;
  geometry.setAttribute("position", plane.getAttribute("position"));
  geometry.setAttribute("uv", plane.getAttribute("uv"));
  geometry.instanceCount = count;
  const attr = (size: number) =>
    new InstancedBufferAttribute(new Float32Array(count * size), size);
  geometry.setAttribute("aOffset", attr(3));
  geometry.setAttribute("aSize", attr(2));
  geometry.setAttribute("aGlyph", attr(2));
  geometry.setAttribute("aAngle", attr(1));
  return geometry;
}

export type Module = {
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Glyph on show (bottom half and, until a flap starts, top half). */
  cur: number;
  /** Glyph the module is turning towards. */
  target: number;
  /** Glyph on the falling flap's back, while one is falling. */
  next: number | null;
  /** Scene time the current flap started, or the time it may start. */
  t0: number;
};

/** Every module on the face, top row first, and the 3 meshes that draw them. */
export function createModules(atlas: Texture) {
  const modules: Module[] = [];
  MODULE_ROWS.forEach((row, r) => {
    const span = row.n * row.w + (row.n - 1) * MODULE_GAP;
    for (let i = 0; i < row.n; i++) {
      modules.push({
        row: r,
        x: -span / 2 + row.w / 2 + i * (row.w + MODULE_GAP),
        y: row.y,
        w: row.w,
        h: row.h,
        cur: 0,
        target: 0,
        next: null,
        t0: 0,
      });
    }
  });

  const make = (part: Part) => {
    const geometry = halfGeometry(part, modules.length);
    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      side: part === 2 ? DoubleSide : FrontSide,
      uniforms: {
        uAtlas: { value: atlas },
        uPart: { value: part },
        uGrid: { value: [COLS, ROWS] },
      },
    });
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.raycast = () => {};
    return mesh;
  };
  const tops = make(0);
  const bottoms = make(1);
  const flaps = make(2);
  const meshes = [tops, bottoms, flaps];
  const attr = (mesh: (typeof meshes)[number], name: string) =>
    mesh.geometry.getAttribute(name) as InstancedBufferAttribute;

  modules.forEach((m, i) => {
    for (const mesh of meshes) {
      attr(mesh, "aOffset").setXYZ(i, m.x, m.y, 0);
      attr(mesh, "aSize").setXY(i, m.w, m.h);
    }
  });

  /** Writes every module's glyphs and flap angle to the GPU attributes. */
  function sync(time: number, flipSeconds: number) {
    const topGlyph = attr(tops, "aGlyph");
    const bottomGlyph = attr(bottoms, "aGlyph");
    const flapGlyph = attr(flaps, "aGlyph");
    const flapAngle = attr(flaps, "aAngle");
    const flapSize = attr(flaps, "aSize");
    modules.forEach((m, i) => {
      const falling = m.next !== null;
      topGlyph.setX(i, falling ? m.next! : m.cur);
      bottomGlyph.setX(i, m.cur);
      flapGlyph.setXY(i, m.cur, m.next ?? m.cur);
      const k = falling
        ? Math.min(1, Math.max(0, (time - m.t0) / flipSeconds))
        : 0;
      flapAngle.setX(i, Math.PI * k * k);
      flapSize.setXY(i, falling ? m.w : 0, falling ? m.h : 0);
    });
    for (const a of [topGlyph, bottomGlyph, flapGlyph, flapAngle, flapSize]) {
      a.needsUpdate = true;
    }
  }

  return { modules, meshes, sync };
}
