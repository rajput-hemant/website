import * as React from "react";
import { poseFor, type Pose } from "@/flavors/darkroom/lib/scene/poses";
import {
  composePrint,
  parseBoard,
  PRINT_H,
  PRINT_W,
  type PrintShape,
} from "@/flavors/darkroom/lib/scene/prints";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  Color,
  DataTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  LinearFilter,
  Matrix4,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PointLight,
  Raycaster,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";

import { kick, motionOn, settle, tween } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import type { Posable } from "@/lib/scene/inspect";
import { input, sceneStore } from "@/lib/scene/store";
import { SceneMonitor } from "@/components/semantic/scene/scene-monitor";

/** Tray width, depth, wall and height; the liquid inside it; the print lying on the bottom. */
const W = 4.3;
const D = 3.2;
const T = 0.09;
const HW = 0.46;
const LW = W - 2 * T;
const LD = D - 2 * T;
const PW = 3.4;
const PH = (PW * PRINT_H) / PRINT_W;
const LIQUID_Y = 0.3;
/** Height-field resolution: about 6k triangles. */
const GX = 64;
const GY = 48;
const FOV = 30;
/** How long a print takes to come up, seconds; darks reach density first. */
const DEVELOP_S = 1.8;
/** A ripple dies out after this long, ms. */
const RIPPLE_MS = 2600;
const MAX_RIPPLES = 12;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/*
 * The print develops from blank paper: each texel darkens once the
 * developer time passes its lightness, so shadows come up first. The
 * liquid's height field bends the print underneath it.
 */
const FRAGMENT = /* glsl */ `
uniform sampler2D uTex;
uniform sampler2D uH;
uniform float uT;
uniform vec3 uPaper;
uniform vec3 uLight;
uniform vec2 uS;
varying vec2 vUv;
void main() {
  vec2 lv = (vUv - 0.5) * uS + 0.5;
  float e = 0.012;
  vec2 g = vec2(
    texture2D(uH, lv + vec2(e, 0.0)).r - texture2D(uH, lv - vec2(e, 0.0)).r,
    texture2D(uH, lv + vec2(0.0, e)).r - texture2D(uH, lv - vec2(0.0, e)).r
  );
  vec3 t = texture2D(uTex, vUv + g * 0.05).rgb;
  float l = dot(t, vec3(0.299, 0.587, 0.114));
  float d = clamp(uT * 2.0 - l, 0.0, 1.0);
  gl_FragColor = vec4(mix(uPaper, t, d) * uLight, 1.0);
  #include <colorspace_fragment>
}`;

type Tones = Record<PrintShape["tone"], string> & { paper: string };

const readTones = (): Tones => ({
  paper: tokenColor("--color-scene-paper", "#ffe9dc"),
  hi: tokenColor("--color-img-hi", "#f0cdb6"),
  mid: tokenColor("--color-img-mid", "#8a5341"),
  lo: tokenColor("--color-img-lo", "#1a0c08"),
  black: tokenColor("--color-strip", "#070303"),
  grease: tokenColor("--color-grease", "#ffb26b"),
});

/** The print's texture: the poster's shapes, painted with rects, arcs and paths only (no canvas text). */
function createPrint() {
  const canvas = document.createElement("canvas");
  canvas.width = PRINT_W;
  canvas.height = PRINT_H;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;

  const draw = (shapes: readonly PrintShape[], tones: Tones) => {
    const g = canvas.getContext("2d");
    if (!g) return;
    g.globalAlpha = 1;
    g.fillStyle = tones.paper;
    g.fillRect(0, 0, PRINT_W, PRINT_H);
    for (const shape of shapes) {
      g.globalAlpha = shape.kind === "rect" ? (shape.alpha ?? 1) : 1;
      g.fillStyle = tones[shape.tone];
      g.beginPath();
      switch (shape.kind) {
        case "rect":
          g.rect(shape.x, shape.y, shape.w, shape.h);
          g.fill();
          break;
        case "circle":
          g.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
          g.fill();
          break;
        case "poly":
          for (let i = 0; i < shape.points.length; i += 2) {
            g.lineTo(shape.points[i] ?? 0, shape.points[i + 1] ?? 0);
          }
          g.closePath();
          g.fill();
          break;
        case "ring":
          g.strokeStyle = tones.grease;
          g.lineWidth = 5;
          g.ellipse(shape.cx, shape.cy, shape.rx, shape.ry, 0, 0, Math.PI * 2);
          g.stroke();
          break;
      }
    }
    texture.needsUpdate = true;
  };

  return { texture, draw };
}

type Ripple = { x: number; z: number; a: number; t: number };

/** Steps the inspect and poses its group; whether it still moves. */
type InspectFrame = (object: Posable, dt: number) => boolean;

function createWorld(inspect: InspectFrame) {
  const root = new Group();
  const hemi = new HemisphereLight(0xffffff, 0x000000, 1);
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(0.9, 5, -4.6);
  const lamp = new PointLight(0xffffff, 2, 0, 0);
  lamp.position.set(-2.4, 3.6, -1.4);
  root.add(hemi, key, lamp);

  // The inspect turns and zooms this group; the route's pose turns the rig in it.
  const turntable = new Group();
  const rig = new Group();
  turntable.add(rig);
  root.add(turntable);

  // The tray: a floor, four walls and the ribs along its bottom.
  const trayMat = new MeshStandardMaterial({ roughness: 0.6 });
  const box = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number
  ) => {
    const mesh = new Mesh(new BoxGeometry(w, h, d), trayMat);
    mesh.position.set(x, y, z);
    rig.add(mesh);
  };
  box(W, 0.1, D, 0, -0.05, 0);
  box(W, HW, T, 0, HW / 2, D / 2 - T / 2);
  box(W, HW, T, 0, HW / 2, -D / 2 + T / 2);
  box(T, HW, LD, W / 2 - T / 2, HW / 2, 0);
  box(T, HW, LD, -W / 2 + T / 2, HW / 2, 0);
  for (let i = 0; i < 4; i++) box(LW, 0.035, 0.06, 0, 0.017, -1.1 + i * 0.73);

  // The developer: specular only, added over the print, sharing its height field.
  const geo = new PlaneGeometry(LW, LD, GX, GY).rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const count = pos?.count ?? 0;
  const bx = new Float32Array(count);
  const bz = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    bx[i] = pos?.getX(i) ?? 0;
    bz[i] = pos?.getZ(i) ?? 0;
  }
  const liqMat = new MeshPhongMaterial({
    color: 0x000000,
    specular: 0xffffff,
    shininess: 80,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const liquid = new Mesh(geo, liqMat);
  liquid.position.y = LIQUID_Y;
  rig.add(liquid);
  const heights = new Uint8Array((GX + 1) * (GY + 1) * 4).fill(128);
  const heightTex = new DataTexture(heights, GX + 1, GY + 1);
  heightTex.minFilter = LinearFilter;
  heightTex.magFilter = LinearFilter;
  heightTex.needsUpdate = true;

  const print = createPrint();
  const uT = { value: 0 };
  const uPaper = new Color();
  const uLight = new Color();
  const paperMat = new ShaderMaterial({
    uniforms: {
      uTex: { value: print.texture },
      uH: { value: heightTex },
      uT,
      uPaper: { value: uPaper },
      uLight: { value: uLight },
      uS: { value: new Vector2(PW / LW, PH / LD) },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
  });
  const paper = new Mesh(
    new PlaneGeometry(PW, PH).rotateX(-Math.PI / 2),
    paperMat
  );
  paper.position.y = 0.055;
  rig.add(paper);

  let pose: Pose = poseFor(sceneStore.getState().route);
  let board = sceneStore.getState().board;
  let tones = readTones();
  const develop = { value: 0 };

  const redraw = () => {
    print.draw(composePrint(pose.print, parseBoard(board)), tones);
  };
  const startDeveloping = () => {
    develop.value = 0;
    tween(develop, { value: 1, duration: DEVELOP_S, ease: "power1.inOut" });
  };

  const colours = () => {
    tones = readTones();
    trayMat.color.set(tokenColor("--color-scene-tray", "#4a1a12"));
    uPaper.set(tones.paper);
    uLight.set(tokenColor("--color-scene-light", "#ff5a3c"));
    hemi.color.set(tokenColor("--color-scene-sky", "#ff3b1f"));
    hemi.groundColor.set(tokenColor("--color-scene-floor", "#1a0503"));
    const glint = tokenColor("--color-scene-glint", "#ff9a78");
    key.color.set(glint);
    lamp.color.set(glint);
    liqMat.specular.set(glint);
    redraw();
    kick();
  };
  colours();
  startDeveloping();
  const offTheme = watchTheme(colours);

  const offStore = sceneStore.subscribe((state, prev) => {
    if (state.route !== prev.route || state.board !== prev.board) {
      pose = poseFor(state.route);
      board = state.board;
      redraw();
      // A new page lays a fresh sheet in the tray, and it develops.
      startDeveloping();
    }
    kick();
  });

  // Ripples from the pointer, found by casting onto the liquid's plane.
  const ripples: Ripple[] = [];
  let flat = true;
  const ray = new Raycaster();
  const ndc = new Vector2();
  const hit = new Vector3();
  const inverse = new Matrix4();
  const surface = new Plane(new Vector3(0, 1, 0), -LIQUID_Y);
  let lastMove = 0;
  let lastDrop = 0;
  let lx = 99;
  let lz = 99;
  let wasDragging = false;
  let dragSide = 0;

  const drop = (x: number, z: number, a: number, now: number) => {
    if (!motionOn()) return;
    ripples.push({ x, z, a, t: now });
    if (ripples.length > MAX_RIPPLES) ripples.shift();
  };

  function pointerOnLiquid(camera: PerspectiveCamera) {
    ndc.set(input.px, input.py);
    ray.setFromCamera(ndc, camera);
    inverse.copy(rig.matrixWorld).invert();
    ray.ray.applyMatrix4(inverse);
    const point = ray.ray.intersectPlane(surface, hit);
    if (!point || Math.abs(point.x) > LW / 2 || Math.abs(point.z) > LD / 2) {
      return null;
    }
    return point;
  }

  function waves(now: number) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      if (now - (ripples[i]?.t ?? 0) > RIPPLE_MS) ripples.splice(i, 1);
    }
    if (!pos) return;
    for (let i = 0; i < count; i++) {
      let h = 0;
      const x = bx[i] ?? 0;
      const z = bz[i] ?? 0;
      for (const r of ripples) {
        const age = (now - r.t) / 1000;
        const k = Math.hypot(x - r.x, z - r.z) - age * 1.3;
        h += r.a * Math.exp(-age * 1.8 - k * k * 9) * Math.cos(k * 20);
      }
      pos.setY(i, h * 0.035);
      const ix = i % (GX + 1);
      const iy = (i - ix) / (GX + 1);
      heights[((GY - iy) * (GX + 1) + ix) * 4] = clamp(128 + h * 90, 0, 255);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    heightTex.needsUpdate = true;
    flat = ripples.length === 0;
  }

  function frame(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    delta: number
  ) {
    const live = motionOn();
    const now = performance.now();

    // Letting go of a sideways drag sloshes the developer to that side.
    if (input.dragging) dragSide = input.dragX;
    if (wasDragging && !input.dragging && Math.abs(dragSide) > 20) {
      drop(Math.sign(dragSide) * LW * 0.42, 0, 1.4, now);
    }
    wasDragging = input.dragging;

    // A drag, pinch or key turns the turntable round the route's pose.
    const busy = inspect(turntable, delta);
    rig.rotation.set(0, pose.yaw, 0);
    turntable.updateMatrixWorld(true);

    const aspect = width / Math.max(1, height);
    const distance = Math.max(7.4, 5.6 / (0.536 * aspect));
    camera.fov = FOV;
    camera.aspect = aspect;
    camera.position.set(0, distance * 0.94, distance * 0.34);
    camera.lookAt(0, 0, 0.05);
    camera.updateProjectionMatrix();

    // Moving over the liquid drops a ripple, at most every 70ms and 0.18 apart.
    if (
      live &&
      (input.inside || input.dragging) &&
      input.movedAt !== lastMove
    ) {
      lastMove = input.movedAt;
      const point = pointerOnLiquid(camera);
      if (
        point &&
        now - lastDrop > 70 &&
        Math.hypot(point.x - lx, point.z - lz) > 0.18
      ) {
        drop(point.x, point.z, input.dragging ? 0.9 : 0.5, now);
        lastDrop = now;
        lx = point.x;
        lz = point.z;
      }
    }
    if (ripples.length || !flat) waves(now);
    const moving = busy || ripples.length > 0;

    uT.value = develop.value;
    settle(moving);
  }

  return {
    root,
    frame,
    dispose() {
      offStore();
      offTheme();
    },
  };
}

/** The developer tray under the safelight, with this page's print coming up in it. */
export function World({ inspect }: { inspect: InspectFrame }) {
  const [w] = React.useState(() => createWorld(inspect));
  React.useEffect(() => () => w.dispose(), [w]);
  useFrame((state, delta) => {
    if (state.camera instanceof PerspectiveCamera) {
      w.frame(state.camera, state.size.width, state.size.height, delta);
    }
  });
  return (
    <>
      <primitive object={w.root} />
      <SceneMonitor />
    </>
  );
}
