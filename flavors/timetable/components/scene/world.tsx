import * as React from "react";
import {
  ASK_SENT_BOARD,
  composeBoard,
  composeMini,
  glyphOf,
  stepToward,
} from "@/flavors/timetable/lib/board";
import {
  asSceneRoute,
  fitDistance,
  HOUSING,
  MINI_H,
  poseFrame,
  poses,
  type SceneRoute,
} from "@/flavors/timetable/lib/scene/poses";
import { flutter } from "@/flavors/timetable/lib/sound/flutter";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type PerspectiveCamera,
} from "three";

import { kick, motionOn, settle, tween } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import {
  input,
  onSceneEvent,
  sceneStore,
  type SceneItem,
} from "@/lib/scene/store";
import { SceneMonitor } from "@/components/semantic/scene/scene-monitor";

import { createExtras } from "./extras";
import { createAtlas, createModules } from "./flaps";

const { W, H, D, rodX } = HOUSING;
const ROD = 6;
const FOV = 26;
/** One flap falls in this long; a real Solari module is close to 20 per second. */
const FLIP = 0.055;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Spring = { x: number; v: number };
const spring = (s: Spring, target: number, k: number, damp: number) => {
  s.v = (s.v + (target - s.x) * k) * damp;
  s.x += s.v;
  return Math.abs(s.v) > 1e-5 || Math.abs(target - s.x) > 1e-4;
};

const fontFamily = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--font-overpass-mono")
    .trim() || "ui-monospace, monospace";

/** The painted housing face: platform plate, owner handle, line stripe well. */
function createPaint() {
  const PX = 360;
  const canvas = document.createElement("canvas");
  canvas.width = W * PX;
  canvas.height = H * PX;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  let last = "";
  const paint = (plate: string, font: string) => {
    const key = `${plate}:${font}`;
    const ctx = canvas.getContext("2d");
    if (!ctx || key === last) return;
    last = key;
    ctx.fillStyle = "#1b2025";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `600 ${0.1 * PX}px ${font}`;
    ctx.letterSpacing = `${0.012 * PX}px`;
    ctx.fillStyle = "#9aa4ad";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(plate, 0.2 * PX, 0.22 * PX);
    ctx.textAlign = "right";
    ctx.fillText("RAJPUT-HEMANT", canvas.width - 0.2 * PX, 0.22 * PX);
    texture.needsUpdate = true;
  };
  return { texture, paint };
}

function createWorld() {
  const root = new Group();
  root.add(new HemisphereLight(0xffffff, 0x3a4450, 1.1));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 5, 6);
  root.add(sun);

  // The pivot sits where the rods meet the ceiling, so drags swing the sign.
  const pivot = new Group();
  pivot.position.y = H / 2 + ROD;
  root.add(pivot);
  const sign = new Group();
  sign.position.y = -(H / 2 + ROD);
  pivot.add(sign);

  const housing = new Mesh(
    new BoxGeometry(W, H, D),
    new MeshStandardMaterial({
      color: "#1b2025",
      roughness: 0.5,
      metalness: 0.45,
    })
  );
  sign.add(housing);

  const painted = createPaint();
  const face = new Mesh(
    new PlaneGeometry(W, H),
    new MeshBasicMaterial({ map: painted.texture })
  );
  face.position.z = D / 2 + 0.001;
  face.raycast = () => {};
  sign.add(face);

  const stripeMaterial = new MeshBasicMaterial({ color: "#39424a" });
  const stripe = new Mesh(new PlaneGeometry(W - 0.4, 0.05), stripeMaterial);
  stripe.position.set(0, -H / 2 + 0.2, D / 2 + 0.002);
  sign.add(stripe);

  const rodMaterial = new MeshStandardMaterial({
    roughness: 0.4,
    metalness: 0.6,
  });
  const rods = new InstancedMesh(
    new CylinderGeometry(0.022, 0.022, ROD, 10),
    rodMaterial,
    2
  );
  [-rodX, rodX].forEach((x, i) =>
    rods.setMatrixAt(i, new Matrix4().makeTranslation(x, H / 2 + ROD / 2, 0))
  );
  sign.add(rods);

  const atlas = createAtlas();
  const flaps = createModules(atlas.texture);
  const modules = new Group();
  modules.position.z = D / 2 + 0.003;
  modules.add(...flaps.meshes);
  sign.add(modules);

  const extras = createExtras(rodMaterial, H / 2 + ROD);
  sign.add(extras.root);

  let mini = false;
  /** A mini board: the housing shortens from the top down, one row stays. */
  function setMini(next: boolean) {
    if (next === mini) return;
    mini = next;
    const scale = mini ? MINI_H / H : 1;
    const lift = mini ? (H - MINI_H) / 2 : 0;
    housing.scale.y = scale;
    housing.position.y = lift;
    face.scale.y = scale;
    face.position.y = lift;
    painted.texture.repeat.y = scale;
    painted.texture.offset.y = 1 - scale;
    stripe.position.y = (mini ? H / 2 - MINI_H : -H / 2) + 0.2;
    flaps.setRowHidden(1, mini);
  }

  let font = fontFamily();
  atlas.draw(font);
  void document.fonts
    ?.load(`700 90px ${font}`)
    .then(() => {
      font = fontFamily();
      atlas.draw(font);
      painted.paint(
        poses[asSceneRoute(sceneStore.getState().route)].plate,
        font
      );
      kick();
    })
    .catch(() => {});

  const colours = () => {
    rodMaterial.color.set(tokenColor("--color-ink", "#14191e"));
    lineColours = Array.from({ length: 6 }, (_, i) =>
      tokenColor(`--color-line-${i + 1}`, "#39424a")
    );
    kick();
  };
  let lineColours: string[] = [];
  colours();
  const offTheme = watchTheme(colours);

  const homeFrame = poseFrame(poses.home);
  const base = {
    yaw: poses.home.yaw,
    pitch: poses.home.pitch,
    fit: poses.home.fit,
    cx: homeFrame.center[0],
    cy: homeFrame.center[1],
    fw: homeFrame.size[0],
    fh: homeFrame.size[1],
  };
  const yaw: Spring = { x: base.yaw, v: 0 };
  const pitch: Spring = { x: base.pitch, v: 0 };
  const stripeTarget = new Color("#39424a");

  let route: SceneRoute | null = null;
  let label = "";
  let line: number | null = null;
  let time = 0;
  let noticeUntil = 0;

  function setBoard(next: string) {
    if (next === label) return;
    const first = label === "";
    label = next;
    const { rows, yellowFrom, yellowRow } = (mini ? composeMini : composeBoard)(
      next
    );
    const still = !motionOn();
    let changed = false;
    let i = 0;
    rows.forEach((text, r) => {
      for (let c = 0; c < text.length; c++, i++) {
        const m = flaps.modules[i];
        if (!m) continue;
        m.target = glyphOf(text[c] ?? " ", r === yellowRow && c >= yellowFrom);
        // A mini board's hidden row is cleared, never turned.
        if (mini && r === 1) {
          m.cur = m.target;
          m.next = null;
        } else if (still) {
          changed ||= m.cur !== m.target;
          m.cur = m.target;
          m.next = null;
        } else if (m.next === null) {
          m.t0 = time + c * 0.022 + r * 0.06;
        }
      }
    });
    // The flaps don't turn with motion off, so the flutter becomes one seat.
    if (still && changed && !first) flutter.seat();
    kick();
  }

  function itemFor(id: string | null, items: SceneItem[]) {
    return id ? items.find((item) => item.id === id) : undefined;
  }

  function update(state: ReturnType<typeof sceneStore.getState>) {
    if (state.route !== route) {
      route = asSceneRoute(state.route);
      const pose = poses[route];
      const frame = poseFrame(pose);
      tween(base, {
        yaw: pose.yaw,
        pitch: pose.pitch,
        fit: pose.fit,
        cx: frame.center[0],
        cy: frame.center[1],
        fw: frame.size[0],
        fh: frame.size[1],
      });
      painted.paint(pose.plate, font);
      if (!!pose.mini !== mini) {
        // Re-lay the board for the new face on the next setBoard.
        setMini(!!pose.mini);
        label = "";
      }
      extras.show(pose.extra ?? null);
    }
    extras.update(state, motionOn());
    // Scroll scrubs the roles on /work; the header's platforms never count.
    const roles = state.items.filter((item) => item.id.startsWith("role:"));
    const scrubbed =
      route === "work" && roles.length > 0
        ? roles[
            Math.min(
              roles.length - 1,
              Math.floor(state.progress * roles.length)
            )
          ]
        : undefined;
    const lit = itemFor(state.hovered, state.items) ?? scrubbed;
    const active = lit?.id ?? null;
    if (active !== state.active) sceneStore.setState({ active });
    const resting = lit?.label || state.board || poses[route ?? "home"].board;
    setBoard(noticeUntil > 0 && time < noticeUntil ? ASK_SENT_BOARD : resting);
    const nextLine = lit?.line ?? null;
    if (nextLine !== line) {
      line = nextLine;
      stripeTarget.set(line ? (lineColours[line - 1] ?? "#39424a") : "#39424a");
      tween(stripeMaterial.color, {
        r: stripeTarget.r,
        g: stripeTarget.g,
        b: stripeTarget.b,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }

  update(sceneStore.getState());
  const offStore = sceneStore.subscribe((state) => {
    update(state);
    kick();
  });

  const offEvents = onSceneEvent((event) => {
    if (event.type !== "ask:sent") return;
    noticeUntil = time + 6;
    setBoard(ASK_SENT_BOARD);
    kick();
  });

  function frame(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    delta: number
  ) {
    time += delta;
    if (noticeUntil > 0 && time >= noticeUntil) {
      noticeUntil = 0;
      update(sceneStore.getState());
    }
    let busy = false;
    let steps = 0;

    for (const m of flaps.modules) {
      if (m.next !== null && time - m.t0 >= FLIP) {
        m.cur = m.next;
        m.next = null;
        m.t0 = time;
        steps++;
      }
      if (m.next === null && m.cur !== m.target && time >= m.t0) {
        m.next = stepToward(m.cur, m.target);
        m.t0 = time;
      }
      if (m.cur !== m.target || m.next !== null) busy = true;
    }
    flaps.sync(time, FLIP);
    if (steps) {
      flutter.steps(steps);
      if (!busy) flutter.seat();
    }

    const live = motionOn();
    const lean = live && input.inside;
    const dragYaw = input.dragX * 0.005;
    const yawTarget =
      base.yaw +
      (lean && !input.dragging ? input.px * 0.14 : 0) +
      dragYaw +
      (live ? input.tiltX : 0);
    const pitchTarget =
      base.pitch +
      (lean ? -input.py * 0.05 : 0) +
      (live ? input.tiltY * 0.3 : 0);
    if (live) {
      busy = spring(yaw, yawTarget, input.dragging ? 0.2 : 0.05, 0.88) || busy;
      busy = spring(pitch, pitchTarget, 0.05, 0.88) || busy;
    } else {
      yaw.x = yawTarget;
      yaw.v = 0;
      pitch.x = pitchTarget;
      pitch.v = 0;
    }
    pivot.rotation.set(pitch.x, yaw.x, clamp(-yaw.v * 1.4, -0.12, 0.12));

    busy = extras.frame(delta, live) || busy;

    const aspect = width / Math.max(1, height);
    const fit = clamp(base.fit, 0.3, 1);
    camera.fov = FOV;
    camera.aspect = aspect;
    camera.position.set(
      base.cx,
      base.cy,
      fitDistance([(base.fw * 1.08) / fit, (base.fh * 1.5) / fit], FOV, aspect)
    );
    camera.lookAt(base.cx, base.cy, 0);
    camera.updateProjectionMatrix();

    settle(busy);
  }

  return {
    root,
    frame,
    dispose() {
      offStore();
      offTheme();
      offEvents();
      extras.dispose();
    },
  };
}

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
