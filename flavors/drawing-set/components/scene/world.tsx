import * as React from "react";
import {
  readPalette,
  watchPalette,
  type Palette,
} from "@/flavors/drawing-set/lib/scene/accent";
import {
  kick,
  motionOn,
  settle,
  tween,
} from "@/flavors/drawing-set/lib/scene/clock";
import {
  CHEST,
  DH,
  drawers,
  drawerY,
  fitDistance,
  NARROW,
  poses,
  TRAY,
  type SceneRoute,
} from "@/flavors/drawing-set/lib/scene/poses";
import {
  clearHovered,
  input,
  onSceneEvent,
  sceneStore,
  setHovered,
  useSceneStore,
} from "@/flavors/drawing-set/lib/scene/store";
import { PerformanceMonitor } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  Euler,
  Group,
  Matrix4,
  Quaternion,
  Vector3,
  type PerspectiveCamera,
} from "three";

import { Linework, setPalette } from "./linework";
import * as M from "./models";

/** Narrower slots stack the CTAs below the drawing, so they swap the CTA shift for NARROW. */
const WIDE_ASPECT = 1.2;

const { W, D, N } = CHEST;
const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const nearest = (from: number, to: number) =>
  to + TAU * Math.round((from - to) / TAU);

type Vec3 = [number, number, number];

/** The pose's prop stage as a parent matrix: scale about `at`, then `lift`. */
function stage(route: SceneRoute) {
  const {
    at = [0, 0, 0],
    scale: k = 1,
    lift = [0, 0, 0],
  } = poses[route].prop ?? {};
  return new Matrix4()
    .makeScale(k, k, k)
    .setPosition(
      at[0] * (1 - k) + lift[0],
      at[1] * (1 - k) + lift[1],
      at[2] * (1 - k) + lift[2]
    );
}

function createWorld() {
  const body = new Linework(M.chestBody());
  const chest = new Linework(M.drawer(), N, true);
  const table = new Linework(M.table());
  const sheets = new Linework(M.sheet(), 12, true);
  const project = new Linework(M.sheet());
  const chain = new Linework(M.segment(), 10, true);
  const cards = new Linework(M.card(), 14, true);
  const catalogue = new Linework(M.catalogueCard(), 24);
  const cloud = new Linework(M.cloud(W + 0.35, DH + 0.35));
  const triangle = new Linework(M.triangle());
  const tray = new Linework(M.tray());
  const slips = new Linework(M.slip(), 12);
  const turntable = new Linework(M.turntable());
  const studies = M.studies().map((parts) => new Linework(parts, 1, true));
  const a4 = new Linework(M.a4());

  const groups: { route: SceneRoute; p: number }[] = (
    [
      "projects",
      "project",
      "work",
      "about",
      "now",
      "ask",
      "lab",
      "resume",
    ] as const
  ).map((route) => ({ route, p: 0 }));
  const presence = (route: SceneRoute) =>
    groups.find((g) => g.route === route)?.p ?? 0;

  const root = new Group();
  for (const lw of [
    body,
    chest,
    table,
    sheets,
    project,
    chain,
    cards,
    catalogue,
    cloud,
    triangle,
    tray,
    slips,
    turntable,
    ...studies,
    a4,
  ]) {
    root.add(lw.group);
  }
  body.commit(1);
  table.commit(1);

  const m = new Matrix4();
  const q = new Quaternion();
  const e = new Euler();
  const p3 = new Vector3();
  const s3 = new Vector3();
  const v = new Vector3();
  const staged = {
    projects: stage("projects"),
    work: stage("work"),
    about: stage("about"),
    now: stage("now"),
    lab: stage("lab"),
  };
  const trayMatrix = new Matrix4()
    .compose(
      p3.set(...TRAY),
      q.setFromEuler(e.set(0, -0.12, 0)),
      s3.set(1, 1, 1)
    )
    .premultiply(M.board)
    .premultiply(stage("ask"));

  function place(
    lw: Linework,
    i: number,
    pos: Vec3,
    rot: Vec3 = [0, 0, 0],
    scale: Vec3 = [1, 1, 1],
    parent?: Matrix4
  ) {
    m.compose(p3.set(...pos), q.setFromEuler(e.set(...rot)), s3.set(...scale));
    if (parent) m.premultiply(parent);
    lw.setMatrix(i, m);
  }

  const open = new Float32Array(N);
  const heat = new Float32Array(N);
  const lift = new Float32Array(14);
  const pop = new Float32Array(10);
  const flip = new Float32Array(14);
  const lean = new Float32Array(24);
  const drop = new Float32Array(12);
  const glow = new Float32Array(12);
  const raise = new Float32Array(studies.length);
  let sent = 0;
  let spin = 0;
  let prog = 0;
  let dragAz = 0;
  let dragEl = 0;
  let par = 0;
  let tiltAz = 0;
  let tiltEl = 0;
  let motion = true;
  let moving = false;
  let leaders = false;

  const approach = (cur: number, target: number, k: number, dt: number) => {
    if (Math.abs(target - cur) < 1e-4) return target;
    moving = true;
    return motion ? cur + (target - cur) * (1 - Math.exp(-k * dt)) : target;
  };

  const first = poses[sceneStore.getState().route];
  const cam = {
    tx: first.target[0],
    ty: first.target[1],
    tz: first.target[2],
    fw: first.frame[0],
    fh: first.frame[1],
    shift: first.shift ?? 0,
    nshift: first.narrowShift ?? NARROW.shift,
    az: first.az,
    el: first.el,
    fov: first.fov,
  };

  let palette: Palette = readPalette();
  setPalette(palette);

  const offPalette = watchPalette((next) => {
    const from = palette;
    const mix = { t: 0 };
    const lerp = (a: number[], b: number[]) =>
      a.map((x, i) => x + ((b[i] ?? x) - x) * mix.t) as Palette["ink"];
    tween(mix, {
      t: 1,
      duration: 0.4,
      ease: "power1.out",
      onUpdate: () => {
        palette = {
          ground: lerp(from.ground, next.ground),
          ink: lerp(from.ink, next.ink),
          accent: lerp(from.accent, next.accent),
        };
        setPalette(palette);
      },
    });
    if (!motionOn()) setPalette((palette = next));
  });

  const offStore = sceneStore.subscribe((s, prev) => {
    if (s.route !== prev.route) {
      const pose = poses[s.route];
      input.dragX = 0;
      input.dragY = 0;
      tween(cam, {
        tx: pose.target[0],
        ty: pose.target[1],
        tz: pose.target[2],
        fw: pose.frame[0],
        fh: pose.frame[1],
        shift: pose.shift ?? 0,
        nshift: pose.narrowShift ?? NARROW.shift,
        az: pose.az,
        el: pose.el,
        fov: pose.fov,
      });
    }
    if (
      s.route !== prev.route ||
      s.hovered !== prev.hovered ||
      s.focused !== prev.focused ||
      s.items !== prev.items ||
      s.progress !== prev.progress
    ) {
      kick();
    }
  });

  const offEvents = onSceneEvent((event) => {
    if (event.type !== "rfi:sent") return;
    const base = sceneStore.getState().items.length || 5;
    if (base + sent < slips.max) sent++;
    const i = Math.min(slips.max, base + sent) - 1;
    drop[i] = 1.4;
    glow[i] = 1;
    kick();
  });

  const wide =
    typeof matchMedia === "function" ? matchMedia("(min-width: 48rem)") : null;

  function drawLeaders(
    camera: PerspectiveCamera,
    canvas: HTMLCanvasElement,
    on: boolean,
    hovered: string | null
  ) {
    const host = canvas.closest("[data-scene-root]");
    const svg = host?.querySelector("[data-scene-leaders]");
    if (!host || !svg) return;
    if (!on || !wide?.matches) {
      if (leaders) svg.innerHTML = "";
      leaders = false;
      return;
    }
    const rr = host.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    let out = "";
    drawers.forEach((d, k) => {
      const el = host.querySelector(`[data-scene-callout="${d.id}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      v.set(W / 2 - 0.08, drawerY(k) + 0.02, D / 2 + 0.03 + open[k]!);
      v.project(camera);
      const x = ((v.x + 1) / 2) * cr.width + cr.left - rr.left;
      const y = ((1 - v.y) / 2) * cr.height + cr.top - rr.top;
      const lx = r.left - rr.left - 8;
      const ly = r.top + r.height / 2 - rr.top;
      const c =
        hovered === d.id ? "var(--color-accent)" : "var(--color-line-strong)";
      out += `<polyline points="${x.toFixed(1)},${y.toFixed(1)} ${(lx - 28).toFixed(1)},${y.toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)}" fill="none" stroke-width="1" style="stroke:${c}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" style="fill:${c}"/>`;
    });
    svg.innerHTML = out;
    leaders = true;
  }

  function frame(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    delta: number,
    canvas: HTMLCanvasElement
  ) {
    const dt = Math.min(delta, 0.1);
    motion = motionOn();
    moving = false;
    const st = sceneStore.getState();
    const route = st.route;
    const pose = poses[route];
    const hovered = st.hovered ?? st.focused;
    const items = st.items;
    const indexOf = (id: string | null) =>
      id ? items.findIndex((it) => it.id === id) : -1;
    const hi = indexOf(hovered);
    let active = hovered;
    prog = approach(prog, st.progress, 8, dt);

    for (const g of groups) {
      const target = g.route === route ? 1 : 0;
      const rate = dt / (target ? 0.9 : 0.35);
      const next = !motion
        ? target
        : target > g.p
          ? Math.min(target, g.p + rate)
          : Math.max(target, g.p - rate);
      if (next !== g.p) moving = true;
      g.p = next;
    }

    for (let k = 0; k < N; k++) {
      const pointed = !!drawers[k] && hovered === drawers[k]!.id;
      const own = k === pose.drawer;
      const target = own
        ? pose.open
        : pointed
          ? route === "home"
            ? 0.55
            : 0.2
          : 0;
      open[k] = approach(open[k]!, target, 7, dt);
      heat[k] = approach(
        heat[k]!,
        pointed || (own && route !== "home") ? 1 : 0,
        10,
        dt
      );
      place(chest, k, [0, drawerY(k), open[k]!]);
      chest.setHot(k, heat[k]!);
    }
    chest.commit(1);

    const pProjects = presence("projects");
    if (pProjects > 0) {
      const n = Math.min(sheets.max, items.length || 6);
      sheets.setCount(n);
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1) - 0.5;
        const l = (lift[i] = approach(lift[i]!, i === hi ? 1 : 0, 9, dt));
        place(
          sheets,
          i,
          [
            t * 1.4,
            drawerY(0) - 0.1 + l * 0.4,
            D / 2 - 0.3 + open[0]! - (n - 1 - i) * 0.06 + l * 0.15,
          ],
          [-0.15 * (1 - l), 0, -t * 0.9 * (1 - 0.6 * l)],
          [1, 1, 1],
          staged.projects
        );
        sheets.setHot(i, l);
      }
    }
    sheets.commit(pProjects);

    place(
      project,
      0,
      [0, 0.035, 0.82],
      [-Math.PI / 2, 0, 0],
      [2.1, 2.1, 2.1],
      M.board
    );
    project.commit(presence("project"));

    const pWork = presence("work");
    if (pWork > 0 || route === "work") {
      const n = Math.min(chain.max, items.length || 4);
      const weights = Array.from({ length: n }, (_, i) =>
        Math.max(0.1, items[i]?.weight ?? 1)
      );
      const total = weights.reduce((a, b) => a + b, 0);
      const gap = 0.04;
      const usable = 3 - gap * (n - 1);
      const current =
        hi >= 0 && hi < n ? hi : Math.min(n - 1, Math.floor(prog * n));
      if (route === "work") active = items[current]?.id ?? null;
      let y = CHEST.H / 2 + 0.1;
      chain.setCount(n);
      for (let i = 0; i < n; i++) {
        const len = (usable * weights[i]!) / total;
        const k = (pop[i] = approach(pop[i]!, i === current ? 1 : 0, 9, dt));
        place(
          chain,
          i,
          [W / 2 + 0.55 + k * 0.1, y - len / 2, D / 2 + 0.15 + k * 0.3],
          [0, 0, 0],
          [1, len, 1],
          staged.work
        );
        chain.setHot(i, k);
        y -= len + gap;
      }
    }
    chain.commit(pWork);

    const pAbout = presence("about");
    if (pAbout > 0) {
      const n = Math.min(cards.max, items.length || 10);
      const step = Math.min(0.08, 0.8 / Math.max(1, n - 1));
      cards.setCount(n);
      for (let i = 0; i < n; i++) {
        const f = (flip[i] = approach(
          flip[i]!,
          clamp(prog * (n + 1) - i, 0, 1),
          8,
          dt
        ));
        const l = (lift[i] = approach(lift[i]!, i === hi ? 1 : 0, 9, dt));
        place(
          cards,
          i,
          [
            0,
            drawerY(3) - DH * 0.4 + l * 0.35,
            D / 2 - 0.3 + open[3]! - i * step,
          ],
          [-0.1 + f * 0.85, 0, 0],
          [1, 1, 1],
          staged.about
        );
        cards.setHot(i, l);
      }
    }
    cards.commit(pAbout);

    const pNow = presence("now");
    if (pNow > 0) {
      const c = prog * (catalogue.max - 1);
      for (let i = 0; i < catalogue.max; i++) {
        const w = Math.exp(-((i - c) ** 2) / 3);
        const l = (lean[i] = approach(lean[i]!, w, 10, dt));
        place(
          catalogue,
          i,
          [0, drawerY(4) - DH * 0.4, D / 2 - 0.3 + open[4]! - i * 0.035],
          [-0.12 + l * 0.6, 0, 0],
          [1, 1, 1],
          staged.now
        );
      }
      const front = D / 2 + 0.09 + open[4]!;
      place(cloud, 0, [0, drawerY(4), front]);
      place(triangle, 0, [W / 2 + 0.35, drawerY(4) + DH / 2 + 0.45, front]);
      cloud.setHot(0, 1);
      triangle.setHot(0, 1);
    }
    catalogue.commit(pNow);
    cloud.commit(pNow);
    triangle.commit(pNow);

    const pAsk = presence("ask");
    if (pAsk > 0) {
      place(tray, 0, [0, 0, 0], [0, 0, 0], [1, 1, 1], trayMatrix);
      const n = Math.min(slips.max, (items.length || 5) + sent);
      slips.setCount(n);
      for (let i = 0; i < n; i++) {
        drop[i] = approach(drop[i]!, 0, 5, dt);
        glow[i] = approach(glow[i]!, 0, 1.2, dt);
        place(
          slips,
          i,
          [
            (((i * 37) % 7) - 3) * 0.012,
            0.03 + 0.012 * (i + 1) + drop[i]!,
            (((i * 53) % 5) - 2) * 0.01,
          ],
          [0, (((i * 29) % 9) - 4) * 0.02, 0],
          [1, 1, 1],
          trayMatrix
        );
        slips.setHot(i, glow[i]!);
      }
    }
    tray.commit(pAsk);
    slips.commit(pAsk);

    const pLab = presence("lab");
    const n = Math.min(studies.length, items.length || 4);
    if (pLab > 0) {
      const base = -input.dragX * 0.008 + prog * Math.PI * 1.5;
      const target =
        hi >= 0 && hi < n ? nearest(spin, cam.az - (hi / n) * TAU) : base;
      spin = approach(spin, target, 5, dt);
      const top = CHEST.H / 2 + 0.225;
      place(turntable, 0, [0, top, 0], [0, spin, 0], [1, 1, 1], staged.lab);
      studies.forEach((lw, i) => {
        const a = (i / n) * TAU + spin;
        const r = (raise[i] = approach(raise[i]!, i === hi ? 1 : 0, 9, dt));
        place(
          lw,
          0,
          [Math.sin(a) * 0.52, top + 0.025 + r * 0.25, Math.cos(a) * 0.52],
          [0, spin * 1.5 + i, 0],
          [1, 1, 1],
          staged.lab
        );
        lw.setHot(0, r);
      });
    }
    turntable.commit(pLab);
    studies.forEach((lw, i) => lw.commit(i < n ? pLab : 0));

    place(a4, 0, [0, 0.034, 0], [-Math.PI / 2, 0, 0], [1.5, 1.5, 1.5], M.board);
    a4.commit(presence("resume"));

    const lab = route === "lab";
    dragAz = approach(dragAz, lab ? 0 : -input.dragX * 0.006, 10, dt);
    dragEl = approach(dragEl, lab ? 0 : input.dragY * 0.004, 10, dt);
    par = approach(par, motion && input.inside ? input.px * 0.08 : 0, 4, dt);
    tiltAz = approach(tiltAz, motion ? input.tiltX : 0, 6, dt);
    tiltEl = approach(tiltEl, motion ? input.tiltY : 0, 6, dt);
    let az = cam.az + dragAz + par + tiltAz;
    let el = cam.el + dragEl + tiltEl;
    if (route === "project") {
      el -= prog * 0.45;
      az += prog * 0.3;
    }
    el = clamp(el, 0.02, 1.45);
    const aspect = width / height;
    const wideSlot = aspect > WIDE_ASPECT;
    const shift = wideSlot ? cam.shift : cam.nshift;
    const d = fitDistance(
      [wideSlot ? cam.fw : cam.fw * NARROW.fit, cam.fh],
      cam.fov,
      aspect,
      Math.max(0, shift)
    );
    camera.position.set(
      cam.tx + d * Math.cos(el) * Math.sin(az),
      cam.ty + d * Math.sin(el),
      cam.tz + d * Math.cos(el) * Math.cos(az)
    );
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    // A view offset slides the image sideways without moving the orbit pivot.
    const offsetX = (-shift * width) / 2;
    if (camera.fov !== cam.fov || camera.view?.offsetX !== offsetX) {
      camera.fov = cam.fov;
      if (offsetX)
        camera.setViewOffset(width, height, offsetX, 0, width, height);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();

    if (active !== st.active) sceneStore.setState({ active });
    drawLeaders(camera, canvas, route === "home", hovered);
    settle(moving);
  }

  return {
    root,
    chest,
    sheets,
    chain,
    cards,
    studies,
    frame,
    dispose() {
      offPalette();
      offStore();
      offEvents();
    },
  };
}

type Hit = { id: string | null; href: string | null };

function handlers(pick: (i: number) => Hit, canvas: HTMLCanvasElement) {
  return {
    onPointerOver(e: ThreeEvent<PointerEvent>) {
      e.stopPropagation();
      const { id, href } = pick(e.instanceId ?? 0);
      if (id) setHovered(id);
      canvas.style.cursor = href ? "pointer" : "";
    },
    onPointerOut(e: ThreeEvent<PointerEvent>) {
      const { id } = pick(e.instanceId ?? 0);
      if (id) clearHovered(id);
      canvas.style.cursor = "";
    },
    onClick(e: ThreeEvent<MouseEvent>) {
      if (e.delta > 6) return;
      e.stopPropagation();
      const { href } = pick(e.instanceId ?? 0);
      if (href) sceneStore.getState().navigate?.(href);
    },
  };
}

const drawerHit = (i: number): Hit => ({
  id: drawers[i]?.id ?? null,
  href: drawers[i]?.href ?? null,
});

const itemHit = (i: number): Hit => {
  const item = sceneStore.getState().items[i];
  return { id: item?.id ?? null, href: item?.href ?? null };
};

function Monitor() {
  const wake = useSceneStore((s) => s.wake);
  const setDpr = useThree((s) => s.setDpr);
  const onDecline = React.useCallback(() => {
    if (sceneStore.getState().tier === 2) {
      setDpr(1);
      sceneStore.setState({ tier: 1, maxTier: 1 });
    } else {
      sceneStore.setState({ tier: 0, maxTier: 0 });
    }
  }, [setDpr]);
  // Remounted on every wake so idle gaps never read as slow frames.
  return (
    <PerformanceMonitor
      key={wake}
      ms={200}
      iterations={6}
      onDecline={onDecline}
    />
  );
}

export function World() {
  const [w] = React.useState(createWorld);
  const canvas = useThree((s) => s.gl.domElement);
  React.useEffect(() => w.dispose, [w]);
  useFrame((state, delta) => {
    w.frame(
      state.camera as PerspectiveCamera,
      state.size.width,
      state.size.height,
      delta,
      canvas
    );
  });

  const onItem = React.useMemo(() => handlers(itemHit, canvas), [canvas]);
  const onDrawer = React.useMemo(() => handlers(drawerHit, canvas), [canvas]);

  return (
    <>
      <primitive object={w.root} />
      <primitive object={w.chest.proxy!} {...onDrawer} />
      <primitive object={w.sheets.proxy!} {...onItem} />
      <primitive object={w.chain.proxy!} {...onItem} />
      <primitive object={w.cards.proxy!} {...onItem} />
      {w.studies.map((lw, i) => (
        <primitive
          key={i}
          object={lw.proxy!}
          {...handlers(() => itemHit(i), canvas)}
        />
      ))}
      <Monitor />
    </>
  );
}
