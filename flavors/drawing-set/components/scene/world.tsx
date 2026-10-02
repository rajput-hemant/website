import * as React from "react";
import {
  readPalette,
  watchPalette,
  type Palette,
} from "@/flavors/drawing-set/lib/scene/accent";
import {
  entriesFor,
  pageState,
  type PageEntry,
} from "@/flavors/drawing-set/lib/scene/page-state";
import {
  asSceneRoute,
  CHEST,
  DH,
  drawers,
  drawerY,
  fitDistance,
  NARROW,
  pointedDrawer,
  poses,
  TRAY,
  type SceneRoute,
} from "@/flavors/drawing-set/lib/scene/poses";
import {
  clampTag,
  createTapGate,
  findDrawn,
  tagLabel,
} from "@/flavors/drawing-set/lib/scene/tag";
import {
  playRouteDrawer,
  playSheet,
} from "@/flavors/drawing-set/lib/sound/scene";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  Box3,
  Euler,
  Group,
  Matrix4,
  Quaternion,
  Vector3,
  type PerspectiveCamera,
} from "three";

import { kick, motionOn, settle, tween } from "@/lib/scene/clock";
import { useSceneSlot } from "@/lib/scene/session";
import {
  clearHovered,
  input,
  onSceneEvent,
  sceneStore,
  setHovered,
  type SceneItem,
} from "@/lib/scene/store";
import { SceneMonitor } from "@/components/semantic/scene/scene-monitor";

import { Linework, setPalette } from "./linework";
import * as M from "./models";
import { A4, CLOUD, createProps, stage, type Hit } from "./props";
import { fly, markTray } from "./views/flight-bus";

/** Narrower slots stack the CTAs below the drawing, so they swap the CTA shift for NARROW. */
const WIDE_ASPECT = 1.2;

const { W, D, N } = CHEST;
const TAU = Math.PI * 2;
const SVG_NS = "http://www.w3.org/2000/svg";
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const nearest = (from: number, to: number) =>
  to + TAU * Math.round((from - to) / TAU);

type Vec3 = [number, number, number];

/** The slot host's origin and size, and each drawer callout's anchor, in scene-root px. */
type LeaderLayout = {
  left: number;
  top: number;
  width: number;
  height: number;
  anchors: ({ x: number; y: number } | null)[];
};

/** A pickable mesh: its linework and what each instance stands for. */
type Target = { lw: Linework; pick: (i: number) => Hit };

/** Touch taps arm a scene part before they follow it (see `createTapGate`). */
const gate = createTapGate();
/** Set by a target's click, so the page's click listener knows it was not a miss. */
let tapped = false;

type LeaderLine = {
  line: SVGPolylineElement;
  dot: SVGCircleElement;
  points: string;
  tone: string;
};

function createWorld() {
  const body = new Linework(M.chestBody());
  const chest = new Linework(M.drawer(), N, true);
  const table = new Linework(M.table());
  const sheets = new Linework(M.sheet(), 12, true);
  const project = new Linework(M.sheet());
  const chain = new Linework(M.segment(), 10, true);
  const cards = new Linework(M.card(), 14, true);
  const catalogue = new Linework(M.catalogueCard(), 24);
  const cloud = new Linework(M.cloud(CLOUD.w, CLOUD.h));
  const triangle = new Linework(M.triangle());
  const tray = new Linework(M.tray());
  const slips = new Linework(M.slip(), 12);
  const turntable = new Linework(M.turntable());
  const studies = M.studies().map((parts) => new Linework(parts, 1, true));
  const a4 = new Linework(M.a4());

  const groups: { route: SceneRoute; p: number }[] = (
    [
      "home",
      "projects",
      "project",
      "work",
      "about",
      "now",
      "ask",
      "rfi",
      "lab",
      "resume",
      "notfound",
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
  const sink = new Float32Array(24);
  const sunk = new Float32Array(12);
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
  let trayOnScreen = false;

  const approach = (cur: number, target: number, k: number, dt: number) => {
    if (Math.abs(target - cur) < 1e-4) return target;
    moving = true;
    return motion ? cur + (target - cur) * (1 - Math.exp(-k * dt)) : target;
  };

  const props = createProps({
    place,
    approach,
    presence,
    busy: () => {
      moving = true;
    },
  });
  for (const lw of props.lineworks) root.add(lw.group);

  const targets: Target[] = [
    { lw: chest, pick: drawerHit },
    { lw: sheets, pick: sheetHit },
    { lw: chain, pick: itemHit },
    { lw: cards, pick: itemHit },
    ...studies.map((lw, i) => ({ lw, pick: () => itemHit(i) })),
    ...props.pickable,
  ];

  const first = poses[asSceneRoute(sceneStore.getState().route)];
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
      gate.disarm();
      const pose = poses[asSceneRoute(s.route)];
      playRouteDrawer(poses[asSceneRoute(prev.route)], pose);
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

  const offPage = pageState.subscribe(() => kick());

  const file = (height: number) => {
    const base = sceneStore.getState().items.length || 5;
    if (base + sent < slips.max) sent++;
    const i = Math.min(slips.max, base + sent) - 1;
    drop[i] = height;
    glow[i] = 1;
    kick();
  };
  // A sent RFI flies from the composer when the flight view can take it
  // (views/flight-view.tsx) and settles into the tray as it lands;
  // otherwise it drops straight in.
  const offEvents = onSceneEvent((event) => {
    if (event.type !== "ask:sent") return;
    if (!fly(() => file(0.12))) file(1.4);
  });

  const wide =
    typeof matchMedia === "function" ? matchMedia("(min-width: 48rem)") : null;

  /*
   * The home callout leaders. Their SVG nodes are made once per slot and
   * only changed attributes are written, so a settled chest costs no DOM
   * work. Host and callout boxes are kept relative to the scene root,
   * which scroll does not move, and re-read only after one of them resizes.
   */
  let leaderRoot: Element | null = null;
  let leaderSvg: Element | null = null;
  let leaderLayout: LeaderLayout | null = null;
  let leaderResize: ResizeObserver | null = null;
  let leaderLines: (LeaderLine | undefined)[] = [];

  function bindLeaders(root: Element, svg: Element, host: HTMLElement) {
    leaderResize?.disconnect();
    leaderRoot = root;
    leaderSvg = svg;
    leaderLines = [];
    leaderLayout = null;
    leaders = false;
    if (typeof ResizeObserver !== "function") return;
    leaderResize = new ResizeObserver(() => {
      leaderLayout = null;
      kick();
    });
    leaderResize.observe(svg);
    leaderResize.observe(host);
    for (const el of root.querySelectorAll("[data-scene-callout]")) {
      leaderResize.observe(el);
    }
  }

  function measureLeaders(root: Element, host: HTMLElement): LeaderLayout {
    const rr = root.getBoundingClientRect();
    const cr = host.getBoundingClientRect();
    return {
      left: cr.left - rr.left,
      top: cr.top - rr.top,
      width: cr.width,
      height: cr.height,
      anchors: drawers.map((d) => {
        const el = root.querySelector(`[data-scene-callout="${d.id}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left - rr.left - 8, y: r.top + r.height / 2 - rr.top };
      }),
    };
  }

  function leaderLine(svg: Element, k: number): LeaderLine {
    const existing = leaderLines[k];
    if (existing) return existing;
    const line = document.createElementNS(SVG_NS, "polyline");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke-width", "1");
    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("r", "2.4");
    svg.append(line, dot);
    return (leaderLines[k] = { line, dot, points: "", tone: "" });
  }

  function drawLeaders(
    camera: PerspectiveCamera,
    host: HTMLElement,
    on: boolean,
    hovered: string | null
  ) {
    if (!on || !wide?.matches) {
      if (leaders) {
        for (const l of leaderLines) {
          l?.line.remove();
          l?.dot.remove();
        }
        leaderLines = [];
      }
      leaders = false;
      return;
    }
    const root = host.closest("[data-scene-root]");
    if (!root) return;
    if (root !== leaderRoot || !leaderSvg?.isConnected) {
      const found = root.querySelector("[data-scene-leaders]");
      if (!found) return;
      bindLeaders(root, found, host);
    }
    const svg = leaderSvg;
    if (!svg) return;
    const layout = (leaderLayout ??= measureLeaders(root, host));
    drawers.forEach((d, k) => {
      const anchor = layout.anchors[k];
      if (!anchor) return;
      const l = leaderLine(svg, k);
      v.set(W / 2 - 0.08, drawerY(k) + 0.02, D / 2 + 0.03 + open[k]!);
      v.project(camera);
      const x = (((v.x + 1) / 2) * layout.width + layout.left).toFixed(1);
      const y = (((1 - v.y) / 2) * layout.height + layout.top).toFixed(1);
      const points = `${x},${y} ${(anchor.x - 28).toFixed(1)},${y} ${anchor.x.toFixed(1)},${anchor.y.toFixed(1)}`;
      if (points !== l.points) {
        l.points = points;
        l.line.setAttribute("points", points);
        l.dot.setAttribute("cx", x);
        l.dot.setAttribute("cy", y);
      }
      const tone =
        hovered === d.id ? "var(--color-accent)" : "var(--color-line-strong)";
      if (tone !== l.tone) {
        l.tone = tone;
        l.line.style.stroke = tone;
        l.dot.style.fill = tone;
      }
    });
    leaders = true;
  }

  /*
   * The scene tag: names where the hovered or focused part goes, next to it,
   * on every route (home's drawers are named by the drawers nav instead).
   * Written only when its text or position changes.
   */
  let tagEl: HTMLElement | null = null;
  let tagText = "";
  let tagWidth = 0;
  let tagHeight = 0;
  let tagPos = "";
  const tagBox = new Box3();
  const tagMatrix = new Matrix4();
  const tagPoint = new Vector3();

  const findTarget = (id: string) =>
    findDrawn(
      targets.map((t) => ({
        ...t,
        drawn: t.lw.group.visible && !!t.lw.proxy,
        count: t.lw.count,
      })),
      id
    );

  function hideTag() {
    if (tagEl && tagEl.dataset.on !== undefined) delete tagEl.dataset.on;
  }

  function drawTag(
    camera: PerspectiveCamera,
    host: HTMLElement,
    width: number,
    height: number,
    id: string | null,
    items: readonly SceneItem[],
    callouts: boolean
  ) {
    const root = host.closest("[data-scene-root]");
    if (!tagEl?.isConnected || !root?.contains(tagEl)) {
      tagEl = root?.querySelector<HTMLElement>("[data-scene-tag]") ?? null;
      tagText = "";
      tagPos = "";
    }
    const found =
      id && !(callouts && drawers.some((d) => d.id === id))
        ? findTarget(id)
        : null;
    const label = found ? tagLabel(found.hit, items) : null;
    const geo = found?.t.lw.proxy?.geometry;
    if (!tagEl || !root || !found || !label || !geo) {
      hideTag();
      return;
    }
    if (!geo.boundingBox) geo.computeBoundingBox();
    if (geo.boundingBox) tagBox.copy(geo.boundingBox);
    // The part's top front edge, midway along it.
    tagPoint.set((tagBox.min.x + tagBox.max.x) / 2, tagBox.max.y, tagBox.max.z);
    tagMatrix.fromArray(found.t.lw.matrices, found.i * 16);
    tagPoint.applyMatrix4(tagMatrix).project(camera);
    if (tagPoint.z > 1) {
      hideTag();
      return;
    }
    if (label !== tagText) {
      tagText = label;
      tagEl.textContent = label;
      tagWidth = tagEl.offsetWidth;
      tagHeight = tagEl.offsetHeight;
    }
    const x = clampTag(
      ((tagPoint.x + 1) / 2) * width + host.offsetLeft,
      tagWidth,
      root.clientWidth
    );
    const y = Math.max(
      tagHeight + 14,
      ((1 - tagPoint.y) / 2) * height + host.offsetTop
    );
    // Centred over the point, its bottom edge 10px above it.
    const pos = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, calc(-100% - 10px))`;
    if (pos !== tagPos) {
      tagPos = pos;
      tagEl.style.transform = pos;
    }
    tagEl.dataset.on = "";
  }

  /** Where the tray is drawn on screen, and a slip's width in it, for the RFI flight. */
  function projectTray(
    camera: PerspectiveCamera,
    host: HTMLElement,
    width: number,
    height: number
  ) {
    const box = host.getBoundingClientRect();
    const screen = (x: number, z: number) => {
      tagPoint.set(x, 0.05, z).applyMatrix4(trayMatrix).project(camera);
      return {
        x: box.left + ((tagPoint.x + 1) / 2) * width,
        y: box.top + ((1 - tagPoint.y) / 2) * height,
      };
    };
    const centre = screen(0, 0);
    const left = screen(-0.675, 0);
    const right = screen(0.675, 0);
    return {
      ...centre,
      width: Math.hypot(right.x - left.x, right.y - left.y),
    };
  }

  // A touch tap that lands on no scene part drops the armed one.
  const pressed = (e: PointerEvent) => gate.down(e.pointerType);
  const clicked = () => {
    if (!tapped) {
      const was = gate.disarm();
      if (was) clearHovered(was);
    }
    tapped = false;
  };
  document.addEventListener("pointerdown", pressed, true);
  document.addEventListener("click", clicked);

  function frame(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    delta: number,
    host: HTMLElement
  ) {
    const dt = Math.min(delta, 0.1);
    motion = motionOn();
    moving = false;
    const st = sceneStore.getState();
    const route = asSceneRoute(st.route);
    const pose = poses[route];
    const hovered = st.hovered ?? st.focused;
    const items = st.items;
    const indexOf = (id: string | null) =>
      id ? items.findIndex((it) => it.id === id) : -1;
    const hi = indexOf(hovered);
    const pointedId = pointedDrawer(route, hovered);
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
      const pointed = !!drawers[k] && pointedId === drawers[k]!.id;
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
    const drawn = props.frame({
      route,
      dt,
      hovered,
      pointed: pointedId,
      items,
      progress: prog,
      open,
      motion,
    });

    const pProjects = presence("projects");
    if (pProjects > 0) {
      const list = sheetList();
      const n = Math.min(sheets.max, list.length || 6);
      const lit = hovered ? list.findIndex((e) => e.id === hovered) : -1;
      sheets.setCount(n);
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1) - 0.5;
        const l = (lift[i] = approach(lift[i]!, i === lit ? 1 : 0, 9, dt));
        // A drawing the register's filter hides sinks back into the drawer.
        const down = (sunk[i] = approach(
          sunk[i]!,
          list[i]?.match === false ? 1 : 0,
          7,
          dt
        ));
        const fan = t * (1 - 0.7 * down);
        place(
          sheets,
          i,
          [
            fan * 1.4,
            drawerY(0) - 0.1 + l * 0.4 - down * 0.32,
            D / 2 -
              0.3 +
              open[0]! -
              (n - 1 - i) * 0.06 +
              l * 0.15 -
              down * 0.25,
          ],
          [-0.15 * (1 - l), 0, -fan * 0.9 * (1 - 0.6 * l)],
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
      const log = entriesFor("now");
      const c = prog * (catalogue.max - 1);
      for (let i = 0; i < catalogue.max; i++) {
        // Each card stands for a log entry; the category filter sinks the rest.
        const entry = log?.length ? log[i % log.length] : undefined;
        const down = (sink[i] = approach(
          sink[i]!,
          entry?.match === false ? 1 : 0,
          7,
          dt
        ));
        const w = Math.exp(-((i - c) ** 2) / 3) * (1 - down);
        const l = (lean[i] = approach(lean[i]!, w, 10, dt));
        place(
          catalogue,
          i,
          [
            0,
            drawerY(4) - DH * 0.4 - down * DH * 0.9,
            D / 2 - 0.3 + open[4]! - i * 0.035,
          ],
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
    cloud.commit(Math.min(pNow, drawn.plot));
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
    trayOnScreen = route === "ask" && pAsk > 0.5;

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

    a4.setMatrix(0, A4);
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

    if (drawn.active !== undefined) active = drawn.active;
    if (active !== st.active) sceneStore.setState({ active });
    markTray(trayOnScreen ? projectTray(camera, host, width, height) : null);
    drawLeaders(camera, host, route === "home", pointedId);
    drawTag(camera, host, width, height, hovered, items, route === "home");
    settle(moving);
  }

  return {
    root,
    chest,
    sheets,
    chain,
    cards,
    studies,
    props,
    frame,
    dispose: () => {
      offPalette();
      offStore();
      offEvents();
      offPage();
      props.dispose();
      leaderResize?.disconnect();
      document.removeEventListener("pointerdown", pressed, true);
      document.removeEventListener("click", clicked);
    },
  };
}

/** Mesh pointer handlers; the pointer cursor is set on the slot host. */
function handlers(pick: (i: number) => Hit, slot: SlotRef | null) {
  return {
    onPointerOver(e: ThreeEvent<PointerEvent>) {
      e.stopPropagation();
      const { id, href } = pick(e.instanceId ?? 0);
      if (id) setHovered(id);
      if (slot) slot.current.style.cursor = href ? "pointer" : "";
    },
    onPointerOut(e: ThreeEvent<PointerEvent>) {
      const { id } = pick(e.instanceId ?? 0);
      // An armed touch target keeps its hover (and tag) after the finger lifts.
      if (id && id !== gate.armed) clearHovered(id);
      if (slot) slot.current.style.cursor = "";
    },
    onClick(e: ThreeEvent<MouseEvent>) {
      if (e.delta > 6) return;
      e.stopPropagation();
      tapped = true;
      const { id, href } = pick(e.instanceId ?? 0);
      if (!href) return;
      // Home's drawers are named by the drawers nav at every width, so
      // they go on the first tap; every other part arms first.
      const named =
        pick === drawerHit && sceneStore.getState().route === "home";
      if (named) gate.disarm();
      else if (!gate.go(id)) {
        if (id) setHovered(id);
        return;
      }
      if (pick !== drawerHit) playSheet(e.nativeEvent);
      // An in-page anchor (a resume section) scrolls; anything else navigates.
      if (href.startsWith("#")) {
        document.getElementById(href.slice(1))?.scrollIntoView({
          behavior: motionOn() ? "smooth" : "auto",
          block: "start",
        });
      } else {
        sceneStore.getState().navigate?.(href);
      }
    },
  };
}

const drawerHit = (i: number): Hit => ({
  id: drawers[i]?.id ?? null,
  href: drawers[i]?.href ?? null,
  label: drawers[i]?.label,
});

/** The projects fan: the register's full list when it published one, else the page items. */
function sheetList(): readonly PageEntry[] {
  return (
    entriesFor("projects") ??
    sceneStore
      .getState()
      .items.map((it) => ({ id: it.id, href: it.href, match: true }))
  );
}

const sheetHit = (i: number): Hit => {
  const entry = sheetList()[i];
  return {
    id: entry?.id ?? null,
    href: entry?.href ?? null,
    label: entry?.label,
  };
};

const itemHit = (i: number): Hit => {
  const item = sceneStore.getState().items[i];
  return { id: item?.id ?? null, href: item?.href ?? null };
};

/** The slot view 0 tracks; see `useSceneSlot`. */
type SlotRef = { readonly current: HTMLElement };

/** Drawn as view 0 of the session's viewport canvas, over the slot host. */
export function World() {
  const [w] = React.useState(createWorld);
  const slot = useSceneSlot();
  React.useEffect(() => w.dispose, [w]);
  useFrame((state, delta) => {
    const host = slot?.current;
    if (!host) return;
    // The host's own box, not the view's portal size, which catches up a
    // frame after a slot of another size is attached.
    w.frame(
      state.camera as PerspectiveCamera,
      host.clientWidth || state.size.width,
      host.clientHeight || state.size.height,
      delta,
      host
    );
  });

  const onItem = React.useMemo(() => handlers(itemHit, slot), [slot]);
  const onSheet = React.useMemo(() => handlers(sheetHit, slot), [slot]);
  const onDrawer = React.useMemo(() => handlers(drawerHit, slot), [slot]);

  return (
    <>
      <primitive object={w.root} />
      <primitive object={w.chest.proxy!} {...onDrawer} />
      <primitive object={w.sheets.proxy!} {...onSheet} />
      <primitive object={w.chain.proxy!} {...onItem} />
      <primitive object={w.cards.proxy!} {...onItem} />
      {w.studies.map((lw, i) => (
        <primitive
          key={i}
          object={lw.proxy!}
          {...handlers(() => itemHit(i), slot)}
        />
      ))}
      {w.props.pickable.map(
        ({ lw, pick }, i) =>
          lw.proxy && (
            <primitive
              key={`prop-${i}`}
              object={lw.proxy}
              {...handlers(pick, slot)}
            />
          )
      )}
      <SceneMonitor />
    </>
  );
}
