import * as React from "react";
import { BEAT_MS, onBeat } from "@/flavors/calibre/lib/beat";
import {
  LAYOUT,
  litJewel,
  parseBoard,
  poseFor,
  settings,
  type Pose,
} from "@/flavors/calibre/lib/scene/poses";
import { layTags } from "@/flavors/calibre/lib/tags";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Path,
  PerspectiveCamera,
  PointLight,
  RepeatWrapping,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
} from "three";

import { kick, motionOn, settle } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import type { Posable } from "@/lib/scene/inspect";
import { sceneStore } from "@/lib/scene/store";
import { SceneMonitor } from "@/components/semantic/scene/scene-monitor";

const FOV = 30;
/** Heights above the plate: the train, the bridges over it, the jewels on top. */
const PLATE_Z = 0;
const TRAIN_Z = 0.05;
const BRIDGE_Z = 0.1;
const TOP_Z = 0.16;
/** Escape wheel teeth: it turns one tooth every two beats. */
const ESCAPE_TEETH = 15;
/** The balance's swing either side of rest, radians. */
const AMPLITUDE = 1.1;

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

/** A wheel: a toothed rim with its crossing cut into spokes, extruded. */
function wheelGeometry(r: number, teeth: number, spokes: number) {
  const shape = new Shape();
  const root = r * 0.92;
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = ((i + 0.3) / teeth) * Math.PI * 2;
    const a2 = ((i + 0.55) / teeth) * Math.PI * 2;
    const a3 = ((i + 0.85) / teeth) * Math.PI * 2;
    const p = (a: number, rr: number) =>
      [Math.cos(a) * rr, Math.sin(a) * rr] as const;
    const [x0, y0] = p(a0, root);
    if (i === 0) shape.moveTo(x0, y0);
    else shape.lineTo(x0, y0);
    shape.lineTo(...p(a1, r));
    shape.lineTo(...p(a2, r));
    shape.lineTo(...p(a3, root));
  }
  shape.closePath();
  // Windows between the spokes, leaving a rim and a hub.
  const rim = root * 0.8;
  const hub = r * 0.2;
  for (let i = 0; i < spokes; i++) {
    const w = (Math.PI * 2) / spokes;
    const a0 = i * w + w * 0.14;
    const a1 = (i + 1) * w - w * 0.14;
    const hole = new Path();
    hole.absarc(0, 0, rim, a0, a1, false);
    hole.absarc(0, 0, hub, a1, a0, true);
    hole.closePath();
    shape.holes.push(hole);
  }
  return new ExtrudeGeometry(shape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 1,
    curveSegments: 6,
  });
}

/** A bridge: a bar with round ends from one point to another, extruded. */
function bridgeGeometry(
  a: { x: number; y: number },
  b: { x: number; y: number },
  w: number
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const ang = Math.atan2(dy, dx);
  const shape = new Shape();
  shape.absarc(a.x, a.y, w, ang + Math.PI / 2, ang + (Math.PI * 3) / 2, false);
  shape.absarc(b.x, b.y, w, ang - Math.PI / 2, ang + Math.PI / 2, false);
  shape.closePath();
  return new ExtrudeGeometry(shape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 16,
  });
}

/** Perlage on the plate and Geneva stripes on the bridges: arcs and rects only, never text. */
function finishTexture(kind: "perlage" | "geneva") {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (g) {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 256, 256);
    if (kind === "perlage") {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const cx = x * 32 + (y % 2) * 16 + 16;
          const cy = y * 32 + 16;
          const grad = g.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 20);
          grad.addColorStop(0, "#ffffff");
          grad.addColorStop(1, "#b8bcc2");
          g.fillStyle = grad;
          g.beginPath();
          g.arc(cx, cy, 19, 0, Math.PI * 2);
          g.fill();
        }
      }
    } else {
      for (let i = 0; i < 16; i++) {
        g.fillStyle = i % 2 ? "#e9ecef" : "#c9cdd2";
        g.fillRect(0, i * 16, 256, 16);
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(kind === "perlage" ? 5 : 3, kind === "perlage" ? 5 : 3);
  return texture;
}

/** Steps the inspect and poses its group; whether it still moves. */
type InspectFrame = (object: Posable, dt: number) => boolean;

/** Frames closer than this are driven by something continuous, not the beat. */
const DRIVEN_DT = 1 / 40;
/** How long the monitor stays on after the last driven frame, ms. */
const DRIVEN_HOLD_MS = 500;

function createWorld(
  inspect: InspectFrame,
  onDriven: (driven: boolean) => void
) {
  const root = new Group();
  const hemi = new HemisphereLight(0xffffff, 0x000000, 1.2);
  const key = new DirectionalLight(0xffffff, 2.6);
  key.position.set(-2, 3, 4);
  const rim = new PointLight(0xffffff, 3, 0, 0);
  rim.position.set(2.2, -1.4, 1.6);
  root.add(hemi, key, rim);

  // The inspect turns and zooms this group; the route's pose turns the rig in it.
  const turntable = new Group();
  const rig = new Group();
  turntable.add(rig);
  root.add(turntable);

  const plateMat = new MeshStandardMaterial({
    metalness: 0.75,
    roughness: 0.42,
    map: finishTexture("perlage"),
  });
  const bridgeMat = new MeshStandardMaterial({
    metalness: 0.85,
    roughness: 0.28,
    map: finishTexture("geneva"),
  });
  const goldMat = new MeshStandardMaterial({ metalness: 1, roughness: 0.32 });
  const screwMat = new MeshStandardMaterial({
    metalness: 0.9,
    roughness: 0.22,
  });
  const rubyMat = new MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0.06,
    clearcoat: 1,
  });
  const litMat = new MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0.04,
    clearcoat: 1,
    emissiveIntensity: 0.9,
  });
  const springMat = new LineBasicMaterial();

  // The plate: a disc facing the caseback (+z).
  const plate = new Mesh(new CylinderGeometry(1, 1, 0.08, 96), plateMat);
  plate.rotation.x = Math.PI / 2;
  plate.position.z = PLATE_Z - 0.04;
  rig.add(plate);

  // The going train, barrel to escape wheel.
  const { centre, third, fourth, escape, balance, barrel, fork } = LAYOUT;
  const wheel = (
    at: { x: number; y: number; r: number },
    teeth: number,
    spokes: number
  ) => {
    const mesh = new Mesh(wheelGeometry(at.r, teeth, spokes), goldMat);
    mesh.position.set(at.x, at.y, TRAIN_Z);
    rig.add(mesh);
    return mesh;
  };
  const wheels = {
    barrel: wheel(barrel, 72, 5),
    centre: wheel(centre, 64, 4),
    third: wheel(third, 54, 4),
    fourth: wheel(fourth, 48, 4),
    escape: wheel(escape, ESCAPE_TEETH, 5),
  };

  // Two bridges over the train, each held by blued screws.
  const bridges: [
    { x: number; y: number },
    { x: number; y: number },
    number,
  ][] = [
    [{ x: -0.82, y: 0.06 }, { x: 0.26, y: 0.7 }, 0.1],
    [{ x: 0.02, y: 0.86 }, { x: 0.58, y: -0.5 }, 0.09],
    [{ x: -0.86, y: -0.46 }, { x: -0.12, y: -0.06 }, 0.07],
  ];
  const screwGeo = new CylinderGeometry(0.035, 0.035, 0.02, 20);
  for (const [a, b, w] of bridges) {
    const mesh = new Mesh(bridgeGeometry(a, b, w), bridgeMat);
    mesh.position.z = BRIDGE_Z;
    rig.add(mesh);
    for (const p of [a, b]) {
      const screw = new Mesh(screwGeo, screwMat);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(p.x, p.y, TOP_Z);
      rig.add(screw);
    }
  }

  // The balance: a gold rim on three arms, its blued hairspring under it.
  const balanceGroup = new Group();
  balanceGroup.position.set(balance.x, balance.y, BRIDGE_Z + 0.02);
  const rimMesh = new Mesh(
    new TorusGeometry(balance.r, 0.018, 10, 72),
    goldMat
  );
  balanceGroup.add(rimMesh);
  for (let i = 0; i < 3; i++) {
    const arm = new Mesh(
      new CylinderGeometry(0.008, 0.008, balance.r * 2, 8),
      goldMat
    );
    arm.rotation.z = (i / 3) * Math.PI;
    balanceGroup.add(arm);
  }
  rig.add(balanceGroup);
  const spring: Vector3[] = [];
  for (let i = 0; i <= 360; i++) {
    const t = i / 360;
    const a = t * Math.PI * 2 * 9;
    const r = 0.03 + t * 0.2;
    spring.push(new Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  const hairspring = new Line(
    new BufferGeometry().setFromPoints(spring),
    springMat
  );
  hairspring.position.set(balance.x, balance.y, BRIDGE_Z + 0.005);
  rig.add(hairspring);

  // The pallet fork between the escape wheel and the balance.
  const forkGroup = new Group();
  forkGroup.position.set(fork.x, fork.y, TRAIN_Z + 0.03);
  forkGroup.add(
    new Mesh(
      bridgeGeometry({ x: -0.12, y: 0 }, { x: 0.12, y: 0 }, 0.02),
      bridgeMat
    )
  );
  forkGroup.add(
    new Mesh(
      bridgeGeometry({ x: 0, y: 0 }, { x: -0.3, y: -0.08 }, 0.015),
      bridgeMat
    )
  );
  rig.add(forkGroup);

  // Jewels: a gold chaton and a ruby for each project; the lit one glows.
  const jewelGroup = new Group();
  rig.add(jewelGroup);
  const chatonGeo = new CylinderGeometry(0.05, 0.055, 0.02, 28);
  const rubyGeo = new CylinderGeometry(0.03, 0.034, 0.024, 24);
  const stoneGeo = new CylinderGeometry(0.018, 0.018, 0.03, 16);
  /** Each jewel's stone by number, for the HTML name tags to follow. */
  const stones = new Map<number, Mesh>();
  const setJewels = (count: number, lit: number) => {
    jewelGroup.clear();
    stones.clear();
    for (const seat of settings(count)) {
      const onFork = seat.on === "pallet";
      const z = onFork ? TRAIN_Z + 0.09 : TOP_Z;
      if (!onFork) {
        const chaton = new Mesh(chatonGeo, goldMat);
        chaton.rotation.x = Math.PI / 2;
        chaton.position.set(seat.x, seat.y, z - 0.01);
        jewelGroup.add(chaton);
      }
      const stone = new Mesh(
        onFork ? stoneGeo : rubyGeo,
        seat.n === lit ? litMat : rubyMat
      );
      stone.rotation.x = Math.PI / 2;
      stone.position.set(seat.x, seat.y, z + 0.004);
      if (seat.n === lit) stone.scale.setScalar(1.35);
      jewelGroup.add(stone);
      stones.set(seat.n, stone);
    }
  };

  let pose: Pose = poseFor(sceneStore.getState().route);
  let board = parseBoard(sceneStore.getState().board);
  let lit = litJewel(board, sceneStore.getState().hovered);
  setJewels(board.jewels, lit);

  const colours = () => {
    plateMat.color.set(tokenColor("--color-scene-plate", "#d4d8dc"));
    bridgeMat.color.set(tokenColor("--color-scene-bridge", "#e4e7ea"));
    goldMat.color.set(tokenColor("--color-scene-wheel", "#d2a07f"));
    screwMat.color.set(tokenColor("--color-scene-screw", "#1c3491"));
    springMat.color.set(tokenColor("--color-scene-screw", "#1c3491"));
    const ruby = tokenColor("--color-scene-ruby", "#c0143c");
    rubyMat.color.set(ruby);
    litMat.color.set(ruby);
    litMat.emissive.set(ruby);
    hemi.color.set(tokenColor("--color-scene-sky", "#fff4ee"));
    hemi.groundColor.set(tokenColor("--color-scene-floor", "#6d5448"));
    kick();
  };
  colours();
  const offTheme = watchTheme(colours);

  const offStore = sceneStore.subscribe((state, prev) => {
    if (state.route !== prev.route) pose = poseFor(state.route);
    // A card pointed at or focused lights its jewel; leaving it, the page's own.
    if (state.board !== prev.board || state.hovered !== prev.hovered) {
      const next = parseBoard(state.board);
      const nextLit = litJewel(next, state.hovered);
      if (state.board !== prev.board || nextLit !== lit) {
        board = next;
        lit = nextLit;
        setJewels(board.jewels, lit);
      }
    }
    kick();
  });

  /*
   * The escapement: each beat the balance lands at one end of its swing and
   * the escape wheel lets one half tooth through; half a beat later the
   * balance passes its rest. Two frames a beat, 12 a second, and none
   * between bursts.
   */
  let beats = 0;
  let swing = 0;
  let half: number | undefined;
  const offBeat = onBeat(() => {
    if (!pose.running || !motionOn()) return;
    beats++;
    swing = beats % 2 ? AMPLITUDE : -AMPLITUDE;
    kick();
    window.clearTimeout(half);
    half = window.setTimeout(() => {
      swing = 0;
      kick();
    }, BEAT_MS / 2);
  });

  /** Lays the HTML name tags out over their jewels. */
  const tagAt = new Vector3();
  function tags(camera: PerspectiveCamera, width: number, height: number) {
    if (!document.querySelector("[data-cb-tag]")) return;
    root.updateMatrixWorld();
    camera.updateMatrixWorld();
    layTags(
      document,
      (n) => {
        const stone = stones.get(n);
        if (!stone) return null;
        stone.getWorldPosition(tagAt).project(camera);
        return {
          x: ((tagAt.x + 1) / 2) * width,
          y: ((1 - tagAt.y) / 2) * height,
        };
      },
      width,
      height
    );
  }

  let driven = false;
  let lastDriven = 0;
  const turn = { value: pose.turn };
  const tilt = { value: pose.tilt };

  function frame(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    delta: number
  ) {
    const dt = Math.min(delta, 1 / 20);
    // The route's pose, damped; a drag, pinch or key turns the turntable round it.
    let busy = inspect(turntable, delta);
    if (motionOn()) {
      busy = approach(turn, pose.turn, 0.14, dt) || busy;
      busy = approach(tilt, pose.tilt, 0.14, dt) || busy;
    } else {
      turn.value = pose.turn;
      tilt.value = pose.tilt;
    }
    rig.rotation.set(-tilt.value, 0, turn.value);

    // The train, stepped by the beat: the escape wheel half a tooth a beat.
    const escapeAngle = -(beats / 2) * ((Math.PI * 2) / ESCAPE_TEETH);
    wheels.escape.rotation.z = escapeAngle;
    wheels.fourth.rotation.z = -escapeAngle / 8;
    wheels.third.rotation.z = escapeAngle / 60;
    wheels.centre.rotation.z = -escapeAngle / 480;
    wheels.barrel.rotation.z = escapeAngle / 3600;
    balanceGroup.rotation.z = swing;
    hairspring.rotation.z = swing * 0.3;
    forkGroup.rotation.z = beats % 2 ? 0.12 : -0.12;

    const aspect = width / Math.max(1, height);
    const fit = 1.0 / Math.tan(((FOV / 2) * Math.PI) / 180);
    const distance = fit / Math.min(1, aspect);
    camera.fov = FOV;
    camera.aspect = aspect;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    tags(camera, width, height);

    // The beat alone makes ~12fps bursts, which the perf monitor would read
    // as a slow device; only continuous runs (arrival, a drag, a scroll) count.
    const now = performance.now();
    if (busy || delta < DRIVEN_DT) {
      lastDriven = now;
      if (!driven) onDriven((driven = true));
    } else if (driven && now - lastDriven > DRIVEN_HOLD_MS) {
      onDriven((driven = false));
    }

    settle(busy);
  }

  return {
    root,
    frame,
    dispose() {
      window.clearTimeout(half);
      offBeat();
      offStore();
      offTheme();
    },
  };
}

/** The movement behind the sapphire caseback, beating with the dial. */
export function World({ inspect }: { inspect: InspectFrame }) {
  const [driven, setDriven] = React.useState(true);
  const [w] = React.useState(() => createWorld(inspect, setDriven));
  React.useEffect(() => () => w.dispose(), [w]);
  useFrame((state, delta) => {
    if (state.camera instanceof PerspectiveCamera) {
      w.frame(state.camera, state.size.width, state.size.height, delta);
    }
  });
  return (
    <>
      <primitive object={w.root} />
      <SceneMonitor paused={!driven} />
    </>
  );
}
