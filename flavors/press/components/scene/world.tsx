import * as React from "react";
import { createPrint } from "@/flavors/press/components/scene/print";
import {
  asSceneRoute,
  poses,
  printFor,
  samePrint,
  type PrintContent,
} from "@/flavors/press/lib/scene/poses";
import { springStep } from "@/flavors/press/lib/scene/spring";
import { paperFlex, pressVoices } from "@/flavors/press/lib/sound/voices";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  BoxGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Plane,
  PlaneGeometry,
  Vector3,
  type PerspectiveCamera,
} from "three";

import { kick, motionOn, settle } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import { input, sceneStore } from "@/lib/scene/store";
import {
  createGrainPool,
  isSoundOn,
  startLoop,
  type LoopHandle,
} from "@/lib/sound";
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
/** The sheet-in view transition's delay (styles.css `.page-in`), in seconds. */
const SHEET_IN_DELAY = 0.06;
/** Drag speed, in CSS px per second, that flexes the paper at full level. */
const FLEX_SPEED = 900;
/** How far a fully read page feeds its sheet out of the nip. */
const READ_OUT = 0.5;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

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
  front.material.onBeforeCompile = print.compile;
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
  const printOf = () => {
    const { hovered, items } = sceneStore.getState();
    return printFor(pose, hovered, items);
  };
  let content = printOf();
  // The furthest the visitor has read this page's section, 0..1.
  let read = 0;
  const S: Record<string, number> = {
    feed: motionOn() ? -FEED : 0,
    peel: pose.peel,
    yaw: pose.yaw,
    pitch: 0,
    mis: 1,
  };
  let drawnPeel = -1;
  let printed: PrintContent | null = null;
  // The peel's speed, per second: carried from the drag into the release.
  let peelV = 0;
  let armed = false;
  // The sheet feed has its own budget, so the link's platen kiss a few ms
  // earlier never makes the click limiter drop it.
  const feeds = createGrainPool({ maxPerSecond: 2, minGap: 0.25 });
  let flex: LoopHandle | null = null;
  let lastPull = 0;

  const colours = () => {
    ink1.color.set(tokenColor("--color-pink", "#ff48b0"));
    ink2.color.set(tokenColor("--color-blue", "#3255a4"));
    key.color.set(tokenColor("--color-ink", "#2a4690"));
    const paper = tokenColor("--color-shade", "#d6d9d3");
    shade.color.set(paper);
    back.material.color.set(paper);
    board.material.color.set(paper);
    print.colours();
    kick();
  };
  colours();
  const offTheme = watchTheme(colours);

  void document.fonts?.ready
    .then(() => {
      printed = null;
      kick();
    })
    .catch(() => {});

  const offStore = sceneStore.subscribe((state, prev) => {
    if (state.route !== prev.route) {
      pose = poses[asSceneRoute(state.route)];
      // A new page feeds a new sheet out of the nip, a link or a peel turn
      // alike. The sound lands with the sheet-in view transition.
      if (motionOn()) S.feed = -FEED;
      if (isSoundOn()) {
        feeds.play(pressVoices.feed, {
          delay: motionOn() ? SHEET_IN_DELAY : 0,
        });
      }
      read = 0;
    } else if (
      pose.reads &&
      state.progress !== prev.progress &&
      state.progress > read
    ) {
      // Only a change counts: until this page reports its own progress the
      // store still holds the last page's.
      read = state.progress;
    }
    // Read with the press out of view, the sheet is already out when it
    // comes back: nothing animates under the scroll back up.
    if (pose.reads && !state.visible && state.route === prev.route) {
      S.feed = read * READ_OUT;
    }
    if (
      state.route !== prev.route ||
      state.hovered !== prev.hovered ||
      state.items !== prev.items
    ) {
      content = printOf();
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
    if (input.dragging && live) armed = peelTarget >= TURN;
    else if (armed) {
      armed = false;
      sceneStore.getState().navigate?.(pose.next);
    }
    // Paper flex follows drag speed while a mouse or pen peel is drawn:
    // never under reduced motion (no peel), on touch or in a hidden tab.
    const pull = Math.hypot(input.dragX, input.dragY);
    if (
      live &&
      input.dragging &&
      input.inside &&
      isSoundOn() &&
      !document.hidden
    ) {
      flex ??= startLoop(paperFlex);
      const speed = Math.abs(pull - lastPull) / Math.max(dt, 1e-3);
      const level = clamp(speed / FLEX_SPEED, 0, 1);
      flex.setLevel(level);
      flex.setRate(0.9 + 0.2 * level);
    } else if (flex) {
      flex.stop();
      flex = null;
    }
    lastPull = pull;
    const lean = live && input.inside && !input.dragging;
    const targets = {
      feed: pose.reads ? read * READ_OUT : 0,
      peel: live ? peelTarget : pose.peel,
      yaw: pose.yaw + (lean ? input.px * 0.14 : 0) + (live ? input.tiltX : 0),
      pitch: (lean ? -input.py * 0.05 : 0) + (live ? input.tiltY * 0.2 : 0),
      mis: hovered ? 0 : 1,
    };

    let busy = false;
    for (const [k, target] of Object.entries(targets)) {
      if (!live) {
        S[k] = target;
      } else if (k === "peel" && !input.dragging) {
        // Let go, the corner springs back with the momentum of the release.
        const next = springStep(S.peel!, peelV, target, dt);
        S.peel = next ? next[0] : target;
        peelV = next ? next[1] : 0;
        busy = next !== null || busy;
      } else {
        const before = S[k]!;
        busy = approach(S, k, target, k === "feed" ? 0.07 : 0.14, dt) || busy;
        if (k === "peel") peelV = (S.peel! - before) / Math.max(dt, 1e-3);
      }
    }
    if (!live) peelV = 0;

    rig.rotation.set(S.pitch!, S.yaw!, 0);
    sheet.position.z = S.feed!;
    d1.rotation.x = -S.feed! / R;
    d2.rotation.x = S.feed! / R;
    if (S.peel !== drawnPeel) {
      bend(clamp(S.peel!, 0, 1));
      drawnPeel = S.peel!;
    }
    if (!printed || !samePrint(printed, content)) {
      print.draw(content);
      printed = content;
    }
    print.register(pose, S.mis!);
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
      flex?.stop(0);
      offStore();
      offTheme();
    },
  };
}

/** The press: two ink drums, the sheet they print, and the next one waiting. */
export function World() {
  const [w] = React.useState(createWorld);
  React.useEffect(() => () => w.dispose(), [w]);
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
