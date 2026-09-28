import { loupe } from "@/flavors/survey/lib/loupe";
import {
  heightAt,
  SHEET,
  type Prop,
  type PropKind,
} from "@/flavors/survey/lib/relief";
import type { Board } from "@/flavors/survey/lib/scene/poses";
import {
  BufferGeometry,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  FrontSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LineSegments,
  Mesh,
  ShaderMaterial,
  type Color,
  type Scene,
} from "three";

import { kick } from "@/lib/scene/clock";
import { onSceneEvent } from "@/lib/scene/store";

import { model, type Solid } from "./models";

/** Colours the props borrow from the relief, tweened with it on a theme flip. */
export type PropPalette = {
  paper: Color;
  ink: Color;
  inkFaint: Color;
  water: Color;
  contour: Color;
  wood: Color;
};

/** What the props read each frame. */
export type PropFrame = {
  dt: number;
  time: number;
  now: number;
  motion: boolean;
  hovered: string | null;
  active: string | null;
  /** Sheet units per CSS pixel in the slot. */
  unitsPerPx: number;
  pointer: {
    inside: boolean;
    movedAt: number;
    dragging: boolean;
    dragX: number;
    dragY: number;
  };
};

/** World y per sheet unit of height on screen: the camera's 64 degree tilt. */
const Y_SCALE = 1 / 0.436;
const HEIGHT = SHEET.LIFT * Y_SCALE;
const LOUPE_RADIUS = 80;
const MAX = 48;
const RISE = 6;
/** A filtered-out marker sinks below the ground. */
const SINK = 12;

const vertexShader = /* glsl */ `
uniform float uYScale;
uniform float uTime;
uniform float uScale;
attribute vec4 iPos;
attribute vec4 iState;
varying float vTint;
varying float vAlong;

void main() {
  vec3 p = position * iState.y * uScale;
#ifdef WAVE
  p.z += sin(position.x * 1.4 - uTime * 8.0) * iState.w * position.x * 0.35;
#endif
  float c = cos(iPos.w);
  float s = sin(iPos.w);
  p.xz = vec2(c * p.x + s * p.z, c * p.z - s * p.x);
  p.y *= uYScale;
  vTint = iState.z;
  vAlong = position.x;
  gl_Position = projectionMatrix * viewMatrix *
    vec4(iPos.x + p.x, iPos.y + iState.x + p.y, iPos.z + p.z, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uAlpha;
varying float vTint;
varying float vAlong;

void main() {
  float a = uAlpha;
#ifdef FADE
  a *= 1.0 - clamp(vAlong / 90.0, 0.0, 1.0);
#endif
  gl_FragColor = vec4(mix(uColor, uHot, vTint), a);
}
`;

const rayVertex = /* glsl */ `
attribute float aDist;
attribute float aHot;
varying float vDist;
varying float vHot;

void main() {
  vDist = aDist;
  vHot = aHot;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;

const rayFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uHot;
varying float vDist;
varying float vHot;

void main() {
  if (fract(vDist / 6.0) > 0.55) discard;
  gl_FragColor = vec4(mix(uColor, uHot, vHot), 0.55 + 0.45 * vHot);
}
`;

type Batch = {
  kind: Solid;
  iPos: InstancedBufferAttribute;
  iState: InstancedBufferAttribute;
  geometries: InstancedBufferGeometry[];
  objects: (Mesh | LineSegments)[];
  count: number;
};

/** Per-instance motion: a lift spring, a tint and a wave. */
type Live = {
  prop: Prop;
  batch: Batch;
  index: number;
  lift: { x: number; v: number };
  tint: number;
  wave: number;
  waveFrom: number;
  yaw: { x: number; v: number };
  bob: { x: number; v: number };
  nudge: { x: number; v: number };
  sunk: boolean;
  wasHot: boolean;
};

/** Critically damped by default (stiffness 380, damping 32: about 180ms). */
function spring(
  s: { x: number; v: number },
  target: number,
  dt: number,
  k = 380,
  c = 32
) {
  for (let t = dt; t > 0; t -= 1 / 120) {
    const h = Math.min(t, 1 / 120);
    s.v += (k * (target - s.x) - c * s.v) * h;
    s.x += s.v * h;
  }
  if (Math.abs(s.v) < 1e-3 && Math.abs(target - s.x) < 1e-3) {
    s.x = target;
    s.v = 0;
    return false;
  }
  return true;
}

/** `bearing` as the angle nearest `from`: the short way round. */
const shortWay = (from: number, bearing: number) =>
  from +
  ((((bearing - from + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) %
    (2 * Math.PI)) -
  Math.PI;

const snap = (s: { x: number; v: number }, target: number) => {
  s.x = target;
  s.v = 0;
  return false;
};

/**
 * The props layer: markers, stones, stakes, the tent, buoy and lighthouse
 * that a page's board puts on its square, as a few instanced draws (a fill
 * and its ink edges per kind), plus the dashed sight lines. Each stands on
 * the relief as drawn, loupe included, and answers the page's
 * `data-scene-item` hover. It reports whether anything is still moving, so
 * idle pages render nothing.
 */
export function createProps(scene: Scene, palette: PropPalette) {
  const shared = {
    uYScale: { value: Y_SCALE },
    uTime: { value: 0 },
    uScale: { value: 1 },
    uHot: { value: palette.water },
  };
  const materials: ShaderMaterial[] = [];
  const material = (
    color: Color,
    options: { edges?: boolean; wave?: boolean; beam?: boolean } = {}
  ) => {
    const m = new ShaderMaterial({
      uniforms: {
        ...shared,
        uColor: { value: color },
        uAlpha: { value: options.beam ? 0.16 : 1 },
      },
      vertexShader,
      fragmentShader,
      defines: {
        ...(options.wave && { WAVE: "" }),
        ...(options.beam && { FADE: "" }),
      },
      side: options.wave || options.beam ? DoubleSide : FrontSide,
      transparent: !!options.beam,
      depthWrite: !options.beam,
      // Faces sit a hair behind their ink edges.
      polygonOffset: !options.edges,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    materials.push(m);
    return m;
  };

  const fills: Record<Solid, Color> = {
    pillar: palette.paper,
    antiquity: palette.ink,
    works: palette.paper,
    stone: palette.inkFaint,
    stake: palette.wood,
    tape: palette.contour,
    tent: palette.wood,
    buoy: palette.contour,
    light: palette.paper,
    beam: palette.water,
    theodolite: palette.paper,
    scope: palette.contour,
  };

  const batches = new Map<Solid, Batch>();
  const batchFor = (kind: Solid) => {
    const existing = batches.get(kind);
    if (existing) return existing;
    const base = model(kind);
    const iPos = new InstancedBufferAttribute(new Float32Array(MAX * 4), 4);
    const iState = new InstancedBufferAttribute(new Float32Array(MAX * 4), 4);
    const instanced = (source: BufferGeometry) => {
      const g = new InstancedBufferGeometry();
      g.index = source.index;
      g.setAttribute("position", source.getAttribute("position"));
      g.setAttribute("iPos", iPos);
      g.setAttribute("iState", iState);
      g.instanceCount = 0;
      return g;
    };
    const fill = instanced(base);
    const geometries = [fill];
    const objects: (Mesh | LineSegments)[] = [
      new Mesh(
        fill,
        material(fills[kind], { wave: kind === "tape", beam: kind === "beam" })
      ),
    ];
    if (kind !== "tape" && kind !== "beam") {
      const edges = instanced(new EdgesGeometry(base, 30));
      geometries.push(edges);
      objects.push(
        new LineSegments(edges, material(palette.ink, { edges: true }))
      );
    }
    for (const object of objects) {
      object.frustumCulled = false;
      object.visible = false;
      scene.add(object);
    }
    const batch: Batch = { kind, iPos, iState, geometries, objects, count: 0 };
    batches.set(kind, batch);
    return batch;
  };

  // Sight lines: one draw for all of them.
  const rayGeometry = new BufferGeometry();
  const rayMaterial = new ShaderMaterial({
    uniforms: { uColor: { value: palette.ink }, uHot: shared.uHot },
    vertexShader: rayVertex,
    fragmentShader: rayFragment,
    transparent: true,
    depthWrite: false,
  });
  const rays = new LineSegments(rayGeometry, rayMaterial);
  rays.frustumCulled = false;
  rays.visible = false;
  scene.add(rays);
  let rayProps: Prop[] = [];

  let live: Live[] = [];
  let hills: [number, number, number, number, number][] = [];
  let coast: number = SHEET.X1;
  let spareDropped = false;
  let dropping = false;

  const hillList = () => hills.map(([x, p, sx, h]) => ({ x, p, sx, h }));
  let hillCache = hillList();

  /** Ground height under a point as the mesh draws it, loupe and all, in world y. */
  const groundAt = (x: number, p: number) => {
    if (x > coast) return 0;
    const dx = x - loupe.x;
    const dp = p - loupe.p;
    const r = Math.hypot(dx, dp * 0.9);
    const k =
      r < LOUPE_RADIUS
        ? 0.5 + (0.5 * r * r) / (LOUPE_RADIUS * LOUPE_RADIUS)
        : 1;
    return heightAt(hillCache, loupe.x + dx * k, loupe.p + dp * k) * HEIGHT;
  };

  const solidOf = (kind: PropKind): Solid | null =>
    kind === "ray" || kind === "aim" ? null : kind;

  function setBoard(board: Board) {
    hills = board.hills;
    hillCache = hillList();
    coast = board.coast;
    spareDropped = false;
    dropping = false;
    for (const batch of batches.values()) batch.count = 0;
    live = [];
    const add = (prop: Prop, kind: Solid) => {
      const batch = batchFor(kind);
      if (batch.count >= MAX) return;
      live.push({
        prop,
        batch,
        index: batch.count++,
        lift: { x: 0, v: 0 },
        tint: prop.hot ? 1 : 0,
        wave: 0,
        waveFrom: 0,
        yaw: { x: Math.PI, v: 0 },
        bob: { x: 0, v: 0 },
        nudge: { x: 0, v: 0 },
        sunk: false,
        wasHot: false,
      });
    };
    for (const prop of board.props) {
      const kind = solidOf(prop.kind);
      if (!kind) continue;
      add(prop, kind);
      if (kind === "stake") add(prop, "tape");
      if (kind === "light") add(prop, "beam");
      if (kind === "theodolite") add(prop, "scope");
    }
    for (const batch of batches.values()) {
      for (const g of batch.geometries) g.instanceCount = batch.count;
      for (const o of batch.objects) o.visible = batch.count > 0;
    }
    rayProps = board.props.filter((prop) => prop.kind === "ray" && prop.to);
    const n = rayProps.length * 2;
    rayGeometry.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(n * 3), 3)
    );
    rayGeometry.setAttribute(
      "aDist",
      new Float32BufferAttribute(
        rayProps.flatMap((prop) => [
          0,
          prop.to ? Math.hypot(prop.to[0] - prop.x, prop.to[1] - prop.p) : 0,
        ]),
        1
      )
    );
    rayGeometry.setAttribute(
      "aHot",
      new Float32BufferAttribute(new Float32Array(n), 1)
    );
    rays.visible = n > 0;
    watchHidden();
  }

  // A filter that hides a row sinks its marker; see `watchHidden`.
  let observer: MutationObserver | null = null;
  const markSunk = () => {
    for (const item of live) {
      const id = item.prop.id;
      if (!id?.startsWith("site:")) continue;
      const els = document.querySelectorAll(
        `[data-scene-item="${CSS.escape(id)}"]`
      );
      item.sunk =
        els.length > 0 &&
        [...els].every((el) => el.closest("[hidden]") !== null);
    }
    kick();
  };
  function watchHidden() {
    observer?.disconnect();
    observer = null;
    if (!live.some((item) => item.prop.id?.startsWith("site:"))) return;
    markSunk();
    observer = new MutationObserver(markSunk);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden"],
    });
  }

  const offEvents = onSceneEvent((event) => {
    if (event.type !== "ask:sent") return;
    if (live.some((item) => item.prop.id === "stone:spare") && !spareDropped) {
      spareDropped = true;
      dropping = true;
    }
  });

  /** Steps every prop; true while any is still moving. */
  function step(f: PropFrame) {
    shared.uTime.value = f.time;
    // Wide windows draw props larger, so a marker reads at any zoom.
    shared.uScale.value = Math.min(3, Math.max(1, f.unitsPerPx * 1.6));
    let busy = false;
    const lit = (id: string | undefined) =>
      !!id && (f.hovered === id || f.active === id);

    for (const item of live) {
      const { prop, batch, index } = item;
      const hover = lit(prop.id);
      const hot = !!prop.hot || hover;
      const base = (prop.lift ?? 0) * Y_SCALE;
      let lift = 0;
      let scale = prop.size ?? 1;
      let wave = 0;
      let yaw = 0;
      let dx = 0;

      if (prop.id === "stone:spare") {
        // The composer lifts the spare stone over the cairn; sending drops it on.
        const up = hover && !spareDropped;
        if (!up && !spareDropped) {
          snap(item.lift, 0);
          scale = 0;
        } else {
          const target = up ? 9 : 0;
          const moving = !f.motion
            ? snap(item.lift, target)
            : dropping
              ? spring(item.lift, target, f.dt, 520, 14)
              : spring(item.lift, target, f.dt);
          if (!moving) dropping = false;
          busy = moving || busy;
        }
        lift = item.lift.x;
      } else if (batch.kind === "tape") {
        const target = hot ? 9 : 4.5;
        busy =
          (f.motion
            ? spring(item.lift, target, f.dt)
            : snap(item.lift, target)) || busy;
        lift = item.lift.x;
        // The tape ripples for a moment when its trial is pointed at.
        if (hover && !item.wasHot) item.waveFrom = f.time;
        if (hover && f.motion) {
          wave = Math.exp(-(f.time - item.waveFrom) / 0.9);
          if (wave > 0.01) busy = true;
          else wave = 0;
        }
      } else if (batch.kind === "buoy") {
        // Bobs only while the pointer moves over the inset; a drag nudges it.
        const stirred =
          f.motion && f.pointer.inside && f.now - f.pointer.movedAt < 1200;
        busy = spring(item.bob, stirred ? 1 : 0, f.dt, 40, 12) || busy;
        lift = Math.sin(f.time * 2.2) * 2 * item.bob.x;
        const pull = f.pointer.dragging
          ? Math.max(-12, Math.min(12, f.pointer.dragX * f.unitsPerPx))
          : 0;
        busy =
          (f.motion && !f.pointer.dragging
            ? spring(item.nudge, pull, f.dt, 120, 16)
            : snap(item.nudge, pull)) || busy;
        dx = item.nudge.x;
      } else if (batch.kind === "scope") {
        // The telescope sights the loupe; with motion off it holds on `to`
        // (the peak), and pointed at itself it looks out to the unsurveyed sea.
        const [tx, tp] = prop.to ?? [loupe.x, loupe.p];
        const aim = f.motion ? { x: loupe.x, p: loupe.p } : { x: tx, p: tp };
        const bearing = hover
          ? 0
          : Math.atan2(-(aim.p - prop.p), aim.x - prop.x);
        const target = shortWay(item.yaw.x, bearing);
        busy =
          (f.motion
            ? spring(item.yaw, target, f.dt, 120, 22)
            : snap(item.yaw, target)) || busy;
        yaw = item.yaw.x;
      } else if (batch.kind === "beam") {
        // Sweeps after the loupe under the pointer, or back to land at a hovered page.
        const aim = f.pointer.inside
          ? { x: loupe.x, p: loupe.p }
          : f.active
            ? findAim(f.active)
            : null;
        const bearing =
          f.motion && aim
            ? Math.atan2(-(aim.p - prop.p), aim.x - prop.x)
            : Math.PI;
        const target = shortWay(item.yaw.x, bearing);
        busy =
          (f.motion
            ? spring(item.yaw, target, f.dt, 120, 22)
            : snap(item.yaw, target)) || busy;
        yaw = item.yaw.x;
        lift = 17.2;
      } else {
        // Sunk deep enough to hide the marker at the scale it is drawn.
        const sink = SINK * shared.uScale.value;
        const target = item.sunk
          ? -sink
          : hover && prop.kind !== "stone"
            ? RISE
            : 0;
        busy =
          (f.motion
            ? spring(item.lift, target, f.dt)
            : snap(item.lift, target)) || busy;
        lift = f.motion ? item.lift.x : item.sunk ? -sink : 0;
      }
      item.wasHot = hover;

      const tintTarget = hot && batch.kind !== "beam" ? 1 : 0;
      if (item.tint !== tintTarget) {
        const step = f.motion ? f.dt / 0.12 : 1;
        item.tint =
          tintTarget > item.tint
            ? Math.min(tintTarget, item.tint + step)
            : Math.max(tintTarget, item.tint - step);
        busy = true;
      }

      const x = prop.x + dx;
      batch.iPos.setXYZW(index, x, groundAt(x, prop.p), prop.p, yaw);
      batch.iState.setXYZW(
        index,
        base + lift * Y_SCALE,
        scale,
        item.tint,
        wave
      );
    }
    for (const batch of batches.values()) {
      if (!batch.count) continue;
      batch.iPos.needsUpdate = true;
      batch.iState.needsUpdate = true;
    }

    if (rayProps.length) {
      const pos = rayGeometry.getAttribute("position");
      const hotAttr = rayGeometry.getAttribute("aHot");
      rayProps.forEach((prop, i) => {
        const [tx, tp] = prop.to ?? [prop.x, prop.p];
        const h = lit(prop.id) ? 1 : 0;
        pos.setXYZ(
          i * 2,
          prop.x,
          groundAt(prop.x, prop.p) + 3 * Y_SCALE,
          prop.p
        );
        pos.setXYZ(i * 2 + 1, tx, groundAt(tx, tp) + 3 * Y_SCALE, tp);
        hotAttr.setX(i * 2, h);
        hotAttr.setX(i * 2 + 1, h);
      });
      pos.needsUpdate = true;
      hotAttr.needsUpdate = true;
    }
    return busy;
  }

  let aims: Record<string, [number, number]> = {};
  const findAim = (id: string) => {
    const point = aims[id];
    return point ? { x: point[0], p: point[1] } : null;
  };

  return {
    setBoard(board: Board) {
      aims = board.points;
      setBoard(board);
    },
    step,
    dispose() {
      offEvents();
      observer?.disconnect();
      for (const batch of batches.values()) {
        for (const g of batch.geometries) g.dispose();
      }
      for (const m of materials) m.dispose();
      rayGeometry.dispose();
      rayMaterial.dispose();
    },
  };
}
