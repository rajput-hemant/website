import type { Pose, PrintContent } from "@/flavors/press/lib/scene/poses";
import {
  CanvasTexture,
  Color,
  type WebGLProgramParametersWithUniforms,
} from "three";

import { tokenColor } from "@/lib/scene/colors";

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
  fallback;

/** Prints the plates in the canvas's own blend: multiply on paper, screen on the dark sheet. */
const INK = /* glsl */ `
uniform vec3 printSheet;
uniform vec3 printYellow;
uniform vec3 printPink;
uniform vec3 printBlue;
uniform vec3 printInk;
uniform float printDark;
uniform float printMis;

vec3 printSrgb(vec3 c) {
  return sRGBTransferOETF(vec4(c, 1.0)).rgb;
}
vec3 printOver(vec3 dst, vec3 ink, float a) {
  vec3 src = printSrgb(ink);
  vec3 m = printDark > 0.5 ? 1.0 - (1.0 - dst) * (1.0 - src) : dst * src;
  return mix(dst, m, a);
}
/** The plates' coverage with the plate moved \`d\` canvas pixels. */
vec4 printPlate(vec2 d) {
  return texture2D(map, vMapUv - vec2(d.x, -d.y) / vec2(1024.0, 906.0));
}
`;

/** The sheet, then each plate in page order; the yellow block is a plain box, drawn here antialiased. */
const PRINT = /* glsl */ `
{
  vec2 pos = vec2(vMapUv.x, 1.0 - vMapUv.y) * vec2(1024.0, 906.0);
  vec2 aa = max(fwidth(pos), vec2(1e-3));
  vec2 box = clamp((pos - vec2(63.0, 330.0)) / aa + 0.5, 0.0, 1.0) *
    clamp((vec2(533.0, 750.0) - pos) / aa + 0.5, 0.0, 1.0);
  vec3 print = printSrgb(printSheet);
  print = printOver(print, printYellow, box.x * box.y);
  print = printOver(print, printPink, printPlate(vec2(-12.0, 8.0) * printMis).r);
  print = printOver(print, printBlue, printPlate(vec2(8.0, -5.0) * printMis).r);
  print = printOver(print, printBlue, printPlate(vec2(4.0, 0.0) * printMis).g);
  print = mix(print, printSrgb(printInk), printPlate(vec2(0.0)).b);
  diffuseColor.rgb *= sRGBTransferEOTF(vec4(print, 1.0)).rgb;
}
`;

/** Swaps the standard material's map lookup for the inked plates. */
export function inkPrint(fragmentShader: string) {
  return fragmentShader
    .replace(
      "#include <map_pars_fragment>",
      `#include <map_pars_fragment>\n${INK}`
    )
    .replace("#include <map_fragment>", PRINT);
}

/**
 * The printed side of the sheet: the same overprint as the page. The canvas
 * holds only coverage, one channel per plate (glyph red, rules green, slug
 * blue), and is drawn only when what it prints changes: a route, or the
 * item a visitor points at. The shader inks the plates and slides them out
 * of register, so registering redraws and uploads nothing.
 */
export function createPrint() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 906;
  const texture = new CanvasTexture(canvas);
  texture.anisotropy = 8;

  const uniforms = {
    printSheet: { value: new Color() },
    printYellow: { value: new Color() },
    printPink: { value: new Color() },
    printBlue: { value: new Color() },
    printInk: { value: new Color() },
    printDark: { value: 0 },
    printMis: { value: 1 },
  };

  const draw = (print: PrintContent) => {
    const g = canvas.getContext("2d");
    if (!g) return;
    const display = cssVar("--font-franklin", "sans-serif");
    const mono = cssVar("--font-martian", "monospace");

    g.globalCompositeOperation = "source-over";
    g.fillStyle = "#000";
    g.fillRect(0, 0, 1024, 906);
    // Each plate adds into its own channel, so overlaps never mix.
    g.globalCompositeOperation = "lighter";

    let size = 400;
    g.font = `900 ${size}px ${display}`;
    g.letterSpacing = "-24px";
    const width = g.measureText(print.glyph).width;
    if (width > 900) {
      size = Math.floor((size * 900) / width);
      g.font = `900 ${size}px ${display}`;
    }
    g.fillStyle = "#f00";
    g.fillText(print.glyph, 36, 400);
    g.letterSpacing = "0px";

    // The rule bars: six slots down the right of the sheet.
    g.strokeStyle = "#0f0";
    g.lineWidth = 16;
    g.beginPath();
    print.bars.forEach((bar, i) => {
      if (bar <= 0) return;
      const y = Math.round(496 + i * 47.2);
      g.moveTo(622, y);
      g.lineTo(622 + Math.round(315 * Math.min(1, bar)), y);
    });
    g.stroke();

    g.fillStyle = "#00f";
    g.font = `500 26px ${mono}`;
    g.fillText(print.slug, 44, 862);
    texture.needsUpdate = true;
  };

  const colours = () => {
    uniforms.printSheet.value.set(tokenColor("--color-sheet", "#f2f3f0"));
    uniforms.printYellow.value.set(tokenColor("--color-yellow", "#ffe800"));
    uniforms.printPink.value.set(tokenColor("--color-pink", "#ff48b0"));
    uniforms.printBlue.value.set(tokenColor("--color-blue", "#3255a4"));
    uniforms.printInk.value.set(tokenColor("--color-ink", "#2a4690"));
    uniforms.printDark.value =
      document.documentElement.dataset.theme === "dark" ? 1 : 0;
  };

  /** Misregistration in plate offsets: 0 in register, 1 the page's 6px out. */
  const register = (pose: Pose, mis: number) => {
    uniforms.printMis.value = mis * (pose.spoiled ? 3.5 : 1);
  };

  const compile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = inkPrint(shader.fragmentShader);
  };

  return { texture, draw, colours, register, compile };
}
