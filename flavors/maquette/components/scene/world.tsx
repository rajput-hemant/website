import * as React from "react";
import {
  BAY,
  parseBoard,
  type Block,
  type Material,
} from "@/flavors/maquette/lib/model";
import {
  blockCenter,
  CARD,
  PLINTH,
  REVEAL,
  SITE,
  STOREY,
} from "@/flavors/maquette/lib/scene/axo";
import { stackLabels } from "@/flavors/maquette/lib/scene/labels";
import { poseFor, type Pose } from "@/flavors/maquette/lib/scene/poses";
import { lightAt, lightVector } from "@/flavors/maquette/lib/sun";
import { sunStore } from "@/flavors/maquette/lib/sun-store";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  ShadowMaterial,
  SphereGeometry,
  SpotLight,
  Vector3,
  type WebGLRenderer,
} from "three";

import { kick, motionOn, settle } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import type { Posable } from "@/lib/scene/inspect";
import { sceneStore } from "@/lib/scene/store";
import { SceneMonitor } from "@/components/semantic/scene/scene-monitor";

const FOV = 26;
/** How far a hovered piece lifts off the site, model units. */
const LIFT = 0.16;
const TREES = 6;

/** Approaches `target` by `rate` per 60th of a second; returns whether it still moves. */
function approach(
  state: { value: number },
  target: number,
  rate: number,
  delta: number
) {
  const d = target - state.value;
  if (Math.abs(d) < 1e-4) {
    state.value = target;
    return false;
  }
  state.value += d * (1 - Math.pow(1 - rate, delta * 60));
  return true;
}

const isNight = () => document.documentElement.dataset.theme === "dark";

/** A soft dark pool under the plinth: a radial gradient, no text. */
function contactTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const g = canvas.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(64, 64, 24, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.6)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
}

type Piece = { block: Block; group: Group; lift: { value: number } };

/** Steps the inspect and poses its group; whether it still moves. */
type InspectFrame = (object: Posable, dt: number) => boolean;

function createWorld(gl: WebGLRenderer, inspect: InspectFrame) {
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = PCFShadowMap;
  // Neutral tone mapping keeps white card white under a strong sun.
  gl.toneMapping = NeutralToneMapping;
  const big = sceneStore.getState().tier === 2;

  const root = new Group();
  // The inspect turns and zooms this group; the route's pose turns the rig in it.
  const turntable = new Group();
  const rig = new Group();
  turntable.add(rig);
  root.add(turntable);

  // One hemisphere fill, the sun by day and a single spotlight by night.
  const hemi = new HemisphereLight(0xffffff, 0x9a9994, 0.9);
  root.add(hemi);
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.castShadow = true;
  const map = big ? 2048 : 1024;
  sun.shadow.mapSize.set(map, map);
  Object.assign(sun.shadow.camera, {
    left: -6,
    right: 6,
    top: 6,
    bottom: -6,
    near: 0.5,
    far: 40,
  });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.radius = 5;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.015;
  const spot = new SpotLight(0xfff0da, 7, 0, 0.46, 0.8, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.radius = 4;
  spot.shadow.bias = -0.0005;
  spot.visible = false;
  // The lights ride the plinth: the sun stands where it does over the site, whichever way the model turns.
  rig.add(sun, sun.target, spot, spot.target);

  const M = (roughness: number) =>
    new MeshStandardMaterial({ roughness, metalness: 0 });
  const mats: Record<Material | "plinth", MeshStandardMaterial> = {
    card: M(0.95),
    foam: M(1),
    grey: M(0.95),
    wood: M(0.8),
    plinth: M(0.75),
  };

  const unit = new BoxGeometry(1, 1, 1);
  const box = (
    parent: Group,
    mat: MeshStandardMaterial,
    size: readonly [number, number, number],
    at: readonly [number, number, number]
  ) => {
    const mesh = new Mesh(unit, mat);
    mesh.scale.set(...size);
    mesh.position.set(...at);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // The plinth, its card, a floor that only takes shadow, and a contact pool.
  box(rig, mats.plinth, [PLINTH.w, PLINTH.h, PLINTH.d], [0, -PLINTH.h / 2, 0]);
  box(rig, mats.card, [SITE.w + 0.38, CARD, SITE.d + 0.08], [0, CARD / 2, 0]);
  const floorMat = new ShadowMaterial({ opacity: 0.16 });
  const floor = new Mesh(new PlaneGeometry(40, 40), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -PLINTH.h;
  floor.receiveShadow = true;
  rig.add(floor);
  const pool = new Mesh(
    new PlaneGeometry(PLINTH.w * 1.3, PLINTH.d * 1.45),
    new MeshBasicMaterial({
      map: contactTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.3,
    })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = -PLINTH.h + 0.002;
  rig.add(pool);

  // Dowel trees and one scale figure, placed on free bays.
  const dowel = new CylinderGeometry(0.012, 0.012, 1, 6);
  const crown = new SphereGeometry(0.12, 20, 14);
  const person = new CapsuleGeometry(0.022, 0.12, 4, 8);
  const extras = new Group();
  rig.add(extras);

  const site = new Group();
  rig.add(site);
  let pieces: Piece[] = [];

  /** Card slabs with a recessed reveal under each, so storeys can be counted. */
  function massing(b: Block, mat: MeshStandardMaterial) {
    const g = new Group();
    const w = b.cols * BAY;
    const d = b.rows * BAY;
    for (let s = 0; s < b.storeys; s++) {
      const y = CARD + s * STOREY;
      box(g, mat, [w - 0.05, REVEAL, d - 0.05], [0, y + REVEAL / 2, 0]);
      box(
        g,
        mat,
        [w, STOREY - REVEAL, d],
        [0, y + REVEAL + (STOREY - REVEAL) / 2, 0]
      );
    }
    return g;
  }

  /** Still going up: columns on the bay grid, a slab at every storey, the top left open. */
  function skeleton(b: Block, mat: MeshStandardMaterial) {
    const g = new Group();
    const w = b.cols * BAY;
    const d = b.rows * BAY;
    const h = b.storeys * STOREY;
    for (let i = 0; i <= b.cols; i++)
      for (let j = 0; j <= b.rows; j++)
        box(
          g,
          mat,
          [0.04, h, 0.04],
          [-w / 2 + i * BAY, CARD + h / 2, -d / 2 + j * BAY]
        );
    for (let s = 0; s < b.storeys; s++)
      box(
        g,
        mat,
        [w + 0.04, 0.03, d + 0.04],
        [0, CARD + s * STOREY + 0.015, 0]
      );
    return g;
  }

  function build(blocks: readonly Block[]) {
    site.clear();
    extras.clear();
    pieces = blocks.map((block) => {
      const group =
        block.material === "wood"
          ? skeleton(block, mats.wood)
          : massing(block, mats[block.material]);
      const c = blockCenter(block);
      group.position.set(c.x, 0, c.z);
      site.add(group);
      return { block, group, lift: { value: 0 } };
    });

    // Trees on bays at least one clear of every block, spread by a fixed stride.
    const taken = (i: number, j: number) =>
      blocks.some(
        (b) =>
          i >= b.i - 1 && i <= b.i + b.cols && j >= b.j - 1 && j <= b.j + b.rows
      );
    const free: [number, number][] = [];
    for (let j = 1; j < 10; j += 2)
      for (let i = 1; i < 15; i += 3) if (!taken(i, j)) free.push([i, j]);
    const step = Math.max(1, Math.floor(free.length / TREES));
    free
      .filter((_, k) => k % step === 0)
      .slice(0, TREES)
      .forEach(([i, j], k) => {
        const x = (i + 0.5) * BAY - SITE.w / 2;
        const z = (j + 0.5) * BAY - SITE.d / 2;
        const h = 0.3 + ((k * 37) % 10) / 100;
        const stem = new Mesh(dowel, mats.wood);
        stem.scale.y = h;
        stem.position.set(x, CARD + h / 2, z);
        stem.castShadow = true;
        const ball = new Mesh(crown, mats.card);
        ball.position.set(x, CARD + h + 0.07, z);
        ball.castShadow = true;
        ball.receiveShadow = true;
        extras.add(stem, ball);
        if (k === 0) {
          const figure = new Mesh(person, mats.grey);
          figure.position.set(x + BAY * 0.6, CARD + 0.082, z + 0.05);
          figure.castShadow = true;
          extras.add(figure);
        }
      });
  }

  const tones = { low: new Color(), high: new Color() };
  const colours = () => {
    for (const key of ["card", "foam", "grey", "wood", "plinth"] as const) {
      mats[key].color.set(tokenColor(`--color-scene-${key}`, "#efefeb"));
    }
    hemi.groundColor.set(tokenColor("--color-scene-ground", "#9a9994"));
    tones.low.set(tokenColor("--color-scene-low", "#ffc795"));
    tones.high.set(tokenColor("--color-scene-sun", "#fff8ee"));
    spot.color.copy(tones.high);
    kick();
  };

  let pose: Pose = poseFor(sceneStore.getState().route);
  let board = parseBoard(sceneStore.getState().board);
  const yaw = { value: pose.yaw };
  const pitch = { value: pose.pitch };

  build(board.blocks);
  colours();
  const offTheme = watchTheme(colours);
  const offStore = sceneStore.subscribe((state, prev) => {
    if (state.route !== prev.route || state.board !== prev.board) {
      pose = poseFor(state.route);
      board = parseBoard(state.board);
      build(board.blocks);
    }
    kick();
  });
  const offSun = sunStore.subscribe(() => kick());

  const target = new Vector3();
  const current = new Vector3();
  const toward = new Vector3();
  const pinAt = new Vector3();
  let first = true;

  /** Eases the light toward the study's time (or the lamp's bearing); returns whether it still moves. */
  function light(delta: number, live: boolean) {
    const night = isNight();
    const v = lightVector(lightAt(sunStore.getState().minutes, night));
    target.set(v.x, v.y, v.z);
    let moving = false;
    if (first || !live) {
      current.copy(target);
      first = false;
    } else {
      current.lerp(target, 1 - Math.pow(1 - 0.11, delta * 60));
      if (current.distanceToSquared(target) > 1e-7) moving = true;
      else current.copy(target);
    }
    sun.visible = !night;
    spot.visible = night;
    floorMat.opacity = night ? 0.5 : 0.16;
    toward.copy(current).normalize();
    if (night) {
      spot.position.copy(toward).multiplyScalar(9);
      hemi.intensity = 0.07;
    } else {
      // A low sun is warm and weak; it whitens as it climbs.
      const e = Math.max(toward.y, 0.03);
      sun.position.copy(toward).multiplyScalar(14);
      sun.color.copy(tones.low).lerp(tones.high, Math.min(1, e * 2.2));
      sun.intensity = 1.5 + 2.4 * Math.min(1, e * 1.7);
      hemi.intensity = 1.2 + 0.9 * e;
    }
    return moving;
  }

  /** A pin's label width: the number, then the name 18px in. */
  const pinWidth = (el: HTMLElement) => {
    const name = el.querySelector("i");
    return Math.max(24, name ? 18 + name.offsetWidth : 0);
  };

  /**
   * Moves the HTML pins over their pieces. A name that would run off the
   * right edge is set to the pin's left, and where two labels would overlap
   * the farther pin rises on a longer stem (`stackLabels`). Every width is
   * read before any pin moves, so it costs one layout.
   */
  function pins(camera: PerspectiveCamera, width: number, height: number) {
    const placed: {
      el: HTMLElement;
      x: number;
      y: number;
      w: number;
      flip: boolean;
      on: boolean;
    }[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("[data-mq-pin]")) {
      const piece = pieces.find((p) => p.block.id === el.dataset.mqPin);
      if (!piece) {
        el.style.opacity = "0";
        continue;
      }
      pinAt.set(0, CARD + piece.block.storeys * STOREY + 0.12, 0);
      piece.group.localToWorld(pinAt);
      pinAt.project(camera);
      const x = ((pinAt.x + 1) / 2) * width - 12;
      const y = ((1 - pinAt.y) / 2) * height - 38;
      const w = pinWidth(el);
      placed.push({
        el,
        x,
        y,
        w,
        flip: x + w > width - 4,
        on: piece.lift.value > LIFT / 2,
      });
    }
    const rise = stackLabels(
      placed.map(({ x, y, w, flip }) => ({
        x: flip ? x + 24 - w : x,
        y,
        w,
        h: 24,
      }))
    );
    placed.forEach(({ el, x, y, flip, on }, i) => {
      const r = rise[i] ?? 0;
      el.toggleAttribute("data-flip", flip);
      el.toggleAttribute("data-on", on);
      el.style.opacity = "1";
      el.style.transform = `translate(${x.toFixed(1)}px, ${(y - r).toFixed(1)}px)`;
      el.style.setProperty("--rise", `${r.toFixed(1)}px`);
    });
  }

  function frame(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    delta: number
  ) {
    const live = motionOn();
    const dt = Math.min(delta, 1 / 20);
    let busy = false;

    // The route's pose, eased; a drag, pinch or key turns the turntable round it.
    busy = inspect(turntable, delta);
    busy = approach(yaw, pose.yaw, live ? 0.11 : 0.3, dt) || busy;
    busy = approach(pitch, pose.pitch, live ? 0.11 : 0.3, dt) || busy;

    // A hovered plaque, or the page's own piece, lifts its piece off the site.
    // Items are `piece:<slug>` (plaques, vitrines) or `role:<id>` (phasing rows).
    const hovered = sceneStore
      .getState()
      .hovered?.replace(/^(piece|role):/, "");
    for (const piece of pieces) {
      const up = hovered === piece.block.id || board.focus === piece.block.id;
      const to = up ? LIFT : 0;
      if (live) busy = approach(piece.lift, to, 0.11, dt) || busy;
      else piece.lift.value = to;
      piece.group.position.y = piece.lift.value;
    }

    busy = light(dt, live) || busy;

    rig.rotation.y = yaw.value;
    const aspect = width / Math.max(1, height);
    const distance =
      Math.max(9.6 / aspect, 5.6) / (2 * Math.tan((FOV / 2) * (Math.PI / 180)));
    camera.fov = FOV;
    camera.aspect = aspect;
    camera.position.set(
      0,
      distance * Math.sin(pitch.value) + 0.3,
      distance * Math.cos(pitch.value)
    );
    camera.lookAt(0, 0.3, 0);
    camera.updateProjectionMatrix();
    root.updateMatrixWorld();
    pins(camera, width, height);
    settle(busy);
  }

  return {
    root,
    frame,
    dispose() {
      offStore();
      offTheme();
      offSun();
    },
  };
}

/** The site model on its plinth, under the study's sun or the night lamp. */
export function World({ inspect }: { inspect: InspectFrame }) {
  const gl = useThree((state) => state.gl);
  const [w] = React.useState(() => createWorld(gl, inspect));
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
