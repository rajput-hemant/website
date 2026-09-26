import * as React from "react";
import {
  asSceneRoute,
  poses,
  type Pose,
} from "@/flavors/press/lib/scene/poses";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Plane,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
  type PerspectiveCamera,
} from "three";

import { kick, motionOn, settle } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import { input, sceneStore } from "@/lib/scene/store";
import { SceneMonitor } from "@/components/semantic/scene/scene-monitor";

/** Sheet width and depth, drum radius, mesh segments. */
const W = 2.6;
const D = 2.3;
const R = 0.34;
const SEG = 32;
/** How far back into the nip a new sheet starts when the route changes. */
const FEED = 1.7;
const FOV = 30;
/** The poster's drawing aspect; slots narrower than this pull the camera back. */
const FIT_ASPECT = 560 / 460;
const AIM = new Vector3(-0.15, 0, 0.5);
const VIEW = new Vector3(0.36, 0.46, 0.81).normalize();
/** Peel past this and let go: the page turns to the next sheet. */
const TURN = 0.92;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
  fallback;

/** Approaches `target` by `rate` per 60th of a second; returns whether it still moves. */
function approach(
  state: Record<string, number>,
  key: string,
  target: number,
  rate: number,
  delta: number
) {
  const value = state[key] ?? target;
  const d = target - value;
  if (Math.abs(d) < 5e-4) {
    state[key] = target;
    return false;
  }
  state[key] = value + d * (1 - Math.pow(1 - rate, delta * 60));
  return true;
}

/** The printed side of the sheet: the same overprint as the page, drawn on a canvas. */
function createPrint() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 906;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = (pose: Pose, mis: number) => {
    const g = canvas.getContext("2d");
    if (!g) return;
    const dark = document.documentElement.dataset.theme === "dark";
    const display = cssVar("--font-franklin", "sans-serif");
    const mono = cssVar("--font-martian", "monospace");
    const m = mis * (pose.spoiled ? 3.5 : 1);

    g.globalCompositeOperation = "source-over";
    g.fillStyle = tokenColor("--color-sheet", "#f2f3f0");
    g.fillRect(0, 0, 1024, 906);
    g.globalCompositeOperation = dark ? "screen" : "multiply";

    g.fillStyle = tokenColor("--color-yellow", "#ffe800");
    g.fillRect(63, 330, 470, 420);

    let size = 400;
    g.font = `900 ${size}px ${display}`;
    g.letterSpacing = "-24px";
    const width = g.measureText(pose.glyph).width;
    if (width > 900) {
      size = Math.floor((size * 900) / width);
      g.font = `900 ${size}px ${display}`;
    }
    g.fillStyle = tokenColor("--color-pink", "#ff48b0");
    g.fillText(pose.glyph, 36 - 12 * m, 400 + 8 * m);
    g.fillStyle = tokenColor("--color-blue", "#3255a4");
    g.fillText(pose.glyph, 36 + 8 * m, 400 - 5 * m);
    g.letterSpacing = "0px";

    g.strokeStyle = tokenColor("--color-blue", "#3255a4");
    g.lineWidth = 16;
    g.beginPath();
    for (const [a, b, y] of [
      [622, 937, 496],
      [622, 937, 543],
      [622, 906, 591],
      [622, 843, 685],
      [622, 803, 732],
    ] as const) {
      g.moveTo(a + 4 * m, y);
      g.lineTo(b + 4 * m, y);
    }
    g.stroke();

    g.globalCompositeOperation = "source-over";
    g.fillStyle = tokenColor("--color-ink", "#2a4690");
    g.font = `500 26px ${mono}`;
    g.fillText(pose.slug, 44, 862);
    texture.needsUpdate = true;
  };

  return { texture, draw };
}

function createWorld() {
  const root = new Group();
  root.add(new HemisphereLight(0xffffff, 0x9aa0a8, 1.9));
  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(-2.5, 5, 3.5);
  root.add(sun);

  const rig = new Group();
  root.add(rig);

  const mat = (roughness = 0.6) => new MeshStandardMaterial({ roughness });
  const ink1 = mat();
  const ink2 = mat();
  const shade = mat(0.95);
  const key = mat(0.5);

  const drum = (ink: MeshStandardMaterial, y: number) => {
    const group = new Group();
    group.position.y = y;
    const body = new Mesh(
      new CylinderGeometry(R, R, 3.4, 64).rotateZ(Math.PI / 2),
      [ink, shade, shade]
    );
    const seam = new Mesh(new BoxGeometry(3.41, 0.035, 0.07), key);
    seam.position.y = R;
    const axle = new Mesh(
      new CylinderGeometry(0.07, 0.07, 3.7, 20).rotateZ(Math.PI / 2),
      key
    );
    group.add(body, seam, axle);
    rig.add(group);
    return group;
  };
  const d1 = drum(ink1, R + 0.005);
  const d2 = drum(ink2, -R - 0.005);

  // The next sheet waits on the feed board behind the drums.
  const board = new Mesh(
    new PlaneGeometry(W, 1.7).translate(0, 0.85, 0),
    new MeshStandardMaterial({ roughness: 0.95, side: DoubleSide })
  );
  board.rotation.x = -0.95;
  rig.add(board);

  const print = createPrint();
  const clip0 = new Plane(new Vector3(0, 0, 1), 0);
  const clip = clip0.clone();
  const geo = new PlaneGeometry(W, D, SEG, SEG)
    .rotateX(-Math.PI / 2)
    .translate(0, 0, D / 2);
  const flat = Float32Array.from(geo.attributes.position!.array);
  const front = new Mesh(
    geo,
    new MeshStandardMaterial({
      map: print.texture,
      roughness: 0.92,
      clippingPlanes: [clip],
    })
  );
  const back = new Mesh(
    geo,
    new MeshStandardMaterial({
      roughness: 0.95,
      side: BackSide,
      clippingPlanes: [clip],
    })
  );
  const sheet = new Group();
  sheet.position.y = 0.004;
  sheet.add(front, back);
  rig.add(sheet);

  // Curls the far corner back along the diagonal: `p` 0 lies flat, 1 is peeled.
  const cx = W / 2;
  const cz = D;
  const nl = Math.hypot(W, D);
  const nx = -W / nl;
  const nz = -D / nl;
  function bend(p: number) {
    const reach = 0.06 + p * 1.15;
    const r = 0.16 + p * 0.14;
    const pos = geo.attributes.position!.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = flat[i]!;
      const z = flat[i + 2]!;
      const q = reach - ((x - cx) * nx + (z - cz) * nz);
      let k = 0;
      let h = 0;
      if (q > 0) {
        const th = q / r;
        const along = th < Math.PI ? r * Math.sin(th) : -(q - Math.PI * r);
        h = th < Math.PI ? r * (1 - Math.cos(th)) : 2 * r;
        k = q - along;
      }
      pos[i] = x + nx * k;
      pos[i + 1] = h;
      pos[i + 2] = z + nz * k;
    }
    geo.attributes.position!.needsUpdate = true;
    geo.computeVertexNormals();
  }

  let pose = poses[asSceneRoute(sceneStore.getState().route)];
  const S: Record<string, number> = {
    feed: motionOn() ? -FEED : 0,
    peel: pose.peel,
    yaw: pose.yaw,
    pitch: 0,
    mis: 1,
  };
  let drawnMis = -1;
  let drawnPeel = -1;
  let drawn: Pose | null = null;
  let armed = false;

  const colours = () => {
    ink1.color.set(tokenColor("--color-pink", "#ff48b0"));
    ink2.color.set(tokenColor("--color-blue", "#3255a4"));
    key.color.set(tokenColor("--color-ink", "#2a4690"));
    const paper = tokenColor("--color-shade", "#d6d9d3");
    shade.color.set(paper);
    (back.material as MeshStandardMaterial).color.set(paper);
    (board.material as MeshStandardMaterial).color.set(paper);
    drawn = null;
    kick();
  };
  colours();
  const offTheme = watchTheme(colours);

  void document.fonts?.ready
    .then(() => {
      drawn = null;
      kick();
    })
    .catch(() => {});

  const offStore = sceneStore.subscribe((state, prev) => {
    if (state.route !== prev.route) {
      pose = poses[asSceneRoute(state.route)];
      // A new page feeds a new sheet out of the nip.
      if (motionOn()) S.feed = -FEED;
      drawn = null;
    }
    kick();
  });

  function frame(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    delta: number
  ) {
    const live = motionOn();
    const dt = Math.min(delta, 1 / 20);
    const hovered = sceneStore.getState().hovered !== null;
    const peelTarget = input.dragging
      ? clamp(pose.peel + Math.hypot(input.dragX, input.dragY) / 220, 0, 1)
      : pose.peel;
    if (input.dragging) armed = peelTarget >= TURN;
    else if (armed) {
      armed = false;
      sceneStore.getState().navigate?.(pose.next);
    }
    const lean = live && input.inside && !input.dragging;
    const targets = {
      feed: 0,
      peel: live ? peelTarget : pose.peel,
      yaw: pose.yaw + (lean ? input.px * 0.14 : 0) + (live ? input.tiltX : 0),
      pitch: (lean ? -input.py * 0.05 : 0) + (live ? input.tiltY * 0.2 : 0),
      mis: hovered ? 0 : 1,
    };

    let busy = false;
    for (const [k, target] of Object.entries(targets)) {
      if (live) {
        busy = approach(S, k, target, k === "feed" ? 0.07 : 0.14, dt) || busy;
      } else {
        S[k] = target;
      }
    }

    rig.rotation.set(S.pitch!, S.yaw!, 0);
    sheet.position.z = S.feed!;
    d1.rotation.x = -S.feed! / R;
    d2.rotation.x = S.feed! / R;
    if (S.peel !== drawnPeel) {
      bend(S.peel!);
      drawnPeel = S.peel!;
    }
    if (drawn !== pose || S.mis !== drawnMis) {
      print.draw(pose, S.mis!);
      drawn = pose;
      drawnMis = S.mis!;
    }
    rig.updateMatrixWorld();
    clip.copy(clip0).applyMatrix4(rig.matrixWorld);

    const aspect = width / Math.max(1, height);
    camera.fov = FOV;
    camera.aspect = aspect;
    const distance = 7 * Math.max(1, FIT_ASPECT / aspect);
    camera.position.copy(AIM).addScaledVector(VIEW, distance);
    camera.lookAt(AIM);
    camera.updateProjectionMatrix();

    settle(busy);
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

/** The press: two ink drums, the sheet they print, and the next one waiting. */
export function World() {
  const [w] = React.useState(createWorld);
  React.useEffect(() => w.dispose, [w]);
  useFrame((state, delta) => {
    w.frame(
      state.camera as PerspectiveCamera,
      state.size.width,
      state.size.height,
      delta
    );
  });
  return (
    <>
      <primitive object={w.root} />
      <SceneMonitor />
    </>
  );
}
