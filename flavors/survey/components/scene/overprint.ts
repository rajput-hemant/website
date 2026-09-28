import { SHEET } from "@/flavors/survey/lib/relief";
import type { Board } from "@/flavors/survey/lib/scene/poses";
import {
  DoubleSide,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  type Color,
  type Scene,
  type Vector4,
} from "three";

import { kick, tween } from "@/lib/scene/clock";
import type { SceneState } from "@/lib/scene/store";

/** The relief uniforms the overprint drives (see `shaders.ts`). */
export type OverprintUniforms = {
  uHot: { value: number };
  uHotLift: { value: number };
  uHotMix: { value: number };
  uCurrent: { value: number };
  uCut: { value: Vector4 };
  uRevision: { value: number };
};

export type OverprintFrame = {
  dt: number;
  motion: boolean;
  hovered: string | null;
  route: string;
};

/** A hovered summit's rings rise this far on screen, in sheet units. */
const RISE = 6;

const planeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const planeFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec2 uSize;
uniform float uAlpha;
varying vec2 vUv;

void main() {
  // Ink hachure across the cut face, as an engraved section.
  vec2 p = vUv * uSize;
  float v = (p.x + p.y * 0.8) / 4.0;
  float w = fwidth(v);
  float hatch = 1.0 - smoothstep(0.0, w * 1.2, abs(fract(v - 0.5) - 0.5));
  float edge = step(vUv.y, 0.02) + step(0.985, vUv.y);
  gl_FragColor = vec4(uColor, uAlpha * max(0.12 + hatch * 0.5, edge));
}
`;

/**
 * What the relief overprints on its own shader, reading the page it is on:
 * a hovered summit's contour rings rise in water blue; on /work a cutting
 * plane stands on the ridge of the transect in view (or the one pointed
 * at), with its section line on the ground; on /now revision purple
 * hatches the current summit and runs a strip along the coast, stronger
 * while a revision note is pointed at. One extra draw, on /work only.
 */
export function createOverprint(
  scene: Scene,
  uniforms: OverprintUniforms,
  palette: { ink: Color }
) {
  const size = new Vector2(1, 1);
  const planeMaterial = new ShaderMaterial({
    uniforms: {
      uColor: { value: palette.ink },
      uSize: { value: size },
      uAlpha: { value: 0.55 },
    },
    vertexShader: planeVertex,
    fragmentShader: planeFragment,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
  const planeGeometry = new PlaneGeometry(1, 1).translate(0.5, 0.5, 0);
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.frustumCulled = false;
  plane.visible = false;
  scene.add(plane);

  let board: Board | null = null;
  let hot = -1;
  const lift = { x: 0, v: 0 };
  const cut = { p: 0, x0: 0, x1: 0, top: 0 };
  let cutRole: string | null = null;
  let scrolled: string | null = null;
  let observer: IntersectionObserver | null = null;
  let route = "";

  const roleOf = (id: string | null) =>
    id?.startsWith("role:") && board ? board.ids.indexOf(id.slice(5)) : -1;

  /** Where the cutting plane stands for role `i`: along its ridge, as high as its summit. */
  const cutFor = (i: number) => {
    const hill = board?.hills[i];
    if (!hill || !board) return null;
    const [x, p, sx, h] = hill;
    return {
      p,
      x0: Math.max(SHEET.X0, x - sx * 2.4),
      x1: Math.min(board.coast, x + sx * 2.4),
      top: ((h + 3) * SHEET.LIFT) / 0.436,
    };
  };

  const placeCut = (id: string | null, snap: boolean) => {
    if (id === cutRole) return;
    const next = cutFor(roleOf(id));
    if (!next) return;
    cutRole = id;
    if (snap || plane.visible === false) Object.assign(cut, next);
    else tween(cut, { ...next, duration: 0.6, ease: "expo.out" });
    kick();
  };

  // The transect crossing the middle of the viewport is the one in view.
  const watchTransects = () => {
    observer?.disconnect();
    observer = null;
    if (route !== "work") return;
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("data-scene-item");
          if (id) scrolled = id;
        }
        kick();
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    for (const el of document.querySelectorAll(
      'article[data-scene-item^="role:"]'
    )) {
      observer.observe(el);
    }
  };

  function setBoard(next: Board) {
    board = next;
    uniforms.uCurrent.value = next.hills.findIndex((h) => h[4] === 1);
    cutRole = null;
  }

  function update(state: SceneState) {
    if (state.route !== route) {
      route = state.route;
      scrolled = null;
      cutRole = null;
      watchTransects();
    }
  }

  /** Steps the overprint; true while anything is still moving. */
  function step(f: OverprintFrame) {
    let busy = false;
    const role = roleOf(f.hovered);
    if (role >= 0 && role !== hot) {
      hot = role;
      lift.x = 0;
      lift.v = 0;
      uniforms.uHotMix.value = 0;
    }
    const on = role >= 0 && role === hot;
    // Tint in over 120ms; the rise is a critically damped spring (tint only with motion off).
    const mix = uniforms.uHotMix.value;
    const toMix = on ? 1 : 0;
    if (mix !== toMix) {
      const d = f.motion ? f.dt / 0.12 : 1;
      uniforms.uHotMix.value =
        toMix > mix ? Math.min(1, mix + d) : Math.max(0, mix - d);
      busy = true;
    }
    const toLift = on && f.motion ? RISE / SHEET.LIFT : 0;
    for (let t = f.dt; t > 0; t -= 1 / 120) {
      const h = Math.min(t, 1 / 120);
      lift.v += (380 * (toLift - lift.x) - 32 * lift.v) * h;
      lift.x += lift.v * h;
    }
    if (Math.abs(lift.v) < 1e-3 && Math.abs(toLift - lift.x) < 1e-3) {
      lift.x = toLift;
      lift.v = 0;
    } else busy = true;
    if (!f.motion) lift.x = toLift;
    uniforms.uHotLift.value = lift.x;
    if (!on && uniforms.uHotMix.value === 0 && lift.x === 0) hot = -1;
    uniforms.uHot.value = hot;

    // /work: the cutting plane, snapped to a pointed-at role, eased on scroll.
    const working = f.route === "work" && !!board?.hills.length;
    if (working) {
      const current = board?.hills.findIndex((h) => h[4] === 1) ?? -1;
      const fallback = board?.ids[Math.max(0, current)];
      if (role >= 0) placeCut(f.hovered, true);
      else placeCut(scrolled ?? (fallback ? `role:${fallback}` : null), false);
    }
    plane.visible = working && cutRole !== null;
    if (plane.visible) {
      plane.position.set(cut.x0, 0, cut.p);
      plane.scale.set(Math.max(1, cut.x1 - cut.x0), cut.top, 1);
      size.set(cut.x1 - cut.x0, cut.top * 0.436);
      uniforms.uCut.value.set(cut.p, cut.x0, cut.x1, 1);
    } else {
      uniforms.uCut.value.set(0, 0, 0, 0);
    }

    // /now: revision purple, stronger while a revision note is pointed at.
    const current = uniforms.uCurrent.value;
    const target =
      f.route !== "now" ? 0 : role >= 0 && role === current ? 1 : 0.55;
    const rev = uniforms.uRevision.value;
    if (rev !== target) {
      const d = f.motion ? f.dt / 0.2 : 1;
      uniforms.uRevision.value =
        target > rev ? Math.min(target, rev + d) : Math.max(target, rev - d);
      busy = true;
    }
    return busy;
  }

  return {
    setBoard,
    update,
    step,
    dispose() {
      observer?.disconnect();
      planeGeometry.dispose();
      planeMaterial.dispose();
    },
  };
}
