import * as React from "react";
import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  EdgesGeometry,
  Euler,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera as OrthographicCameraImpl,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { tokenColor } from "@/lib/scene/colors";
import { useSceneSlot } from "@/lib/scene/session";
import { sceneStore } from "@/lib/scene/store";

/*
 * The glyph kit: ink on paper. Every glyph is paper-coloured fills with ink
 * feature edges at 0.55 opacity, the accent only on what's hovered or
 * active, no lights, no shadows and no canvas text. Views use an orthographic
 * camera where one unit is one CSS pixel, origin at the view's centre, y up,
 * so pieces are placed straight from DOM rects.
 */

extend({ OrthographicCamera: OrthographicCameraImpl });

/** Line opacity at rest; hovered or active pieces blend to the accent at 1. */
export const INK_ALPHA = 0.55;

/** A fixed three-quarter view, so flat paper reads as an object on a desk. */
export const DESK_TILT = { x: -0.5, y: 0.42 } as const;

export const palette = {
  paper: new Color(),
  ink: new Color(),
  accent: new Color(),
};

let watching = false;
function readPalette() {
  palette.paper.set(tokenColor("--color-surface", "#f3efe8"));
  palette.ink.set(tokenColor("--color-foreground", "#1c1917"));
  palette.accent.set(tokenColor("--color-accent", "#c4622d"));
  kick();
}

/** Reads the colour tokens once, then again on every theme or accent change. */
export function watchPalette() {
  if (watching) return;
  watching = true;
  readPalette();
  new MutationObserver(readPalette).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-accent", "style"],
  });
}

const lineMaterial = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  vertexShader: /* glsl */ `
    attribute mat4 aMatrix;
    attribute vec4 aTint;
    varying vec4 vTint;
    void main() {
      vTint = aTint;
      gl_Position = projectionMatrix * modelViewMatrix * aMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec4 vTint;
    void main() {
      gl_FragColor = vTint;
      #include <colorspace_fragment>
    }
  `,
});

export type Tone = {
  /** 0 ink edges, 1 accent edges. */
  accent?: number;
  /** Edge opacity; {@link INK_ALPHA} by default, rising to 1 with the accent. */
  alpha?: number;
  /** 0 paper fill, 1 accent fill (the ink in the bottle, the ink drop). */
  wash?: number;
};

/** A unit box with its origin on the bottom face's back edge, for hinges. */
export const unitBox = new BoxGeometry(1, 1, 1);
export const hingeBox = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0);

const hidden = new Matrix4().makeScale(0, 0, 0);
const tmp = new Color();

/**
 * N instances of one part in two draw calls: an instanced paper fill and its
 * instanced feature edges, which share the fill's matrix buffer.
 */
export class Ink {
  readonly object = new Group();
  readonly count: number;
  private readonly fill: InstancedMesh;
  private readonly tint: InstancedBufferAttribute;

  constructor(geometry: BufferGeometry, count: number, threshold = 15) {
    watchPalette();
    this.count = count;
    this.fill = new InstancedMesh(
      geometry,
      new MeshBasicMaterial({
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
      count
    );
    this.fill.frustumCulled = false;
    this.fill.instanceMatrix.setUsage(DynamicDrawUsage);
    this.fill.setColorAt(0, palette.paper);
    const edges = new EdgesGeometry(geometry, threshold);
    const lines = new InstancedBufferGeometry();
    const position = edges.getAttribute("position");
    if (position) lines.setAttribute("position", position);
    lines.setAttribute("aMatrix", this.fill.instanceMatrix);
    this.tint = new InstancedBufferAttribute(new Float32Array(count * 4), 4);
    this.tint.setUsage(DynamicDrawUsage);
    lines.setAttribute("aTint", this.tint);
    lines.instanceCount = count;
    const outline = new LineSegments(lines, lineMaterial);
    outline.frustumCulled = false;
    outline.renderOrder = 1;
    this.object.add(this.fill, outline);
    for (let i = 0; i < count; i++) this.hide(i);
  }

  /** Poses instance `i` and colours it. */
  set(i: number, matrix: Matrix4, tone: Tone = {}) {
    const accent = tone.accent ?? 0;
    this.fill.setMatrixAt(i, matrix);
    this.fill.setColorAt(
      i,
      tmp.copy(palette.paper).lerp(palette.accent, tone.wash ?? 0)
    );
    tmp.copy(palette.ink).lerp(palette.accent, accent);
    const alpha = tone.alpha ?? INK_ALPHA + (1 - INK_ALPHA) * accent;
    this.tint.setXYZW(i, tmp.r, tmp.g, tmp.b, alpha);
  }

  hide(i: number) {
    this.fill.setMatrixAt(i, hidden);
  }

  /** Uploads this frame's poses and colours. */
  flush() {
    this.fill.instanceMatrix.needsUpdate = true;
    if (this.fill.instanceColor) this.fill.instanceColor.needsUpdate = true;
    this.tint.needsUpdate = true;
  }
}

/**
 * A sheet of paper that bends: a plane whose vertices are moved on the CPU
 * (a few hundred at most) and its outline, in two draw calls.
 */
export class Sheet {
  readonly object = new Group();
  readonly width: number;
  readonly height: number;
  private readonly position: BufferAttribute;
  private readonly base: Float32Array;
  private readonly border: number[];
  private readonly line: BufferAttribute;
  private readonly fill: MeshBasicMaterial;
  private readonly stroke: LineBasicMaterial;

  constructor(width: number, height: number, sx: number, sy: number) {
    watchPalette();
    this.width = width;
    this.height = height;
    const geometry = new PlaneGeometry(width, height, sx, sy);
    this.base = Float32Array.from(geometry.getAttribute("position").array);
    this.position = new BufferAttribute(Float32Array.from(this.base), 3);
    this.position.setUsage(DynamicDrawUsage);
    geometry.setAttribute("position", this.position);
    const row = sx + 1;
    const border: number[] = [];
    for (let x = 0; x <= sx; x++) border.push(x);
    for (let y = 1; y <= sy; y++) border.push(y * row + sx);
    for (let x = sx - 1; x >= 0; x--) border.push(sy * row + x);
    for (let y = sy - 1; y >= 1; y--) border.push(y * row);
    this.border = border;
    this.line = new BufferAttribute(new Float32Array(border.length * 3), 3);
    this.line.setUsage(DynamicDrawUsage);
    const outline = new BufferGeometry().setAttribute("position", this.line);
    this.fill = new MeshBasicMaterial({
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    this.stroke = new LineBasicMaterial({
      transparent: true,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, this.fill);
    const loop = new LineLoop(outline, this.stroke);
    mesh.frustumCulled = false;
    loop.frustumCulled = false;
    loop.renderOrder = 1;
    this.object.add(mesh, loop);
    this.deform((_x, _y, out) => out);
  }

  /** Moves every vertex: `bend(x, y, out)` writes the bent position into `out`. */
  deform(bend: (x: number, y: number, out: Vector3) => Vector3) {
    const { position } = this;
    const out = new Vector3();
    for (let i = 0; i < position.count; i++) {
      const x = this.base[i * 3] ?? 0;
      const y = this.base[i * 3 + 1] ?? 0;
      const p = bend(x, y, out.set(x, y, 0));
      position.setXYZ(i, p.x, p.y, p.z);
    }
    position.needsUpdate = true;
    this.border.forEach((index, j) => {
      this.line.setXYZ(
        j,
        position.getX(index),
        position.getY(index),
        position.getZ(index)
      );
    });
    this.line.needsUpdate = true;
  }

  tone({ accent = 0, alpha, wash = 0 }: Tone = {}) {
    this.fill.color.copy(palette.paper).lerp(palette.accent, wash);
    this.stroke.color.copy(palette.ink).lerp(palette.accent, accent);
    this.stroke.opacity = alpha ?? INK_ALPHA + (1 - INK_ALPHA) * accent;
  }
}

/** One ink stroke through points (a thread, a string, a wire clip). */
export class Wire {
  readonly object: Line;
  private readonly position: BufferAttribute;
  private readonly material = new LineBasicMaterial({
    transparent: true,
    depthWrite: false,
  });

  constructor(points: number) {
    watchPalette();
    this.position = new BufferAttribute(new Float32Array(points * 3), 3);
    this.position.setUsage(DynamicDrawUsage);
    const geometry = new BufferGeometry().setAttribute(
      "position",
      this.position
    );
    this.object = new Line(geometry, this.material);
    this.object.frustumCulled = false;
  }

  /** Writes point `i`. */
  point(i: number, x: number, y: number, z = 0) {
    this.position.setXYZ(i, x, y, z);
  }

  flush({ accent = 0, alpha }: Tone = {}) {
    this.position.needsUpdate = true;
    this.material.color.copy(palette.ink).lerp(palette.accent, accent);
    this.material.opacity = alpha ?? INK_ALPHA + (1 - INK_ALPHA) * accent;
  }
}

/** The pixel camera every glyph view draws with (see the header comment). */
export function GlyphCamera() {
  return (
    <OrthographicCamera makeDefault position={[0, 0, 200]} near={1} far={400} />
  );
}

/* ---------------------------------------------------------------------------
 * Anchors: which DOM element a glyph belongs to.
 */

type Anchor = {
  /** The glyph's element, re-resolved when the page swaps it out. */
  el: () => HTMLElement | null;
};

const AnchorContext = React.createContext<Anchor | null>(null);

export function useAnchor(): Anchor {
  const anchor = React.use(AnchorContext);
  if (!anchor) throw new Error("useAnchor must be used inside a glyph view");
  return anchor;
}

/** Flags the glyph's element live, so its posters fade (styles.css). */
function useLiveFlag(el: () => HTMLElement | null, ready: boolean) {
  const flagged = React.useRef<HTMLElement | null>(null);
  useFrame(() => {
    const target = ready ? el() : null;
    if (target === flagged.current) return;
    if (flagged.current) delete flagged.current.dataset.glyphLive;
    if (target) target.dataset.glyphLive = "";
    flagged.current = target;
  });
  React.useEffect(
    () => () => {
      if (flagged.current) delete flagged.current.dataset.glyphLive;
      flagged.current = null;
    },
    []
  );
}

const ReadyContext = React.createContext<(ready: boolean) => void>(() => {});

/**
 * For a glyph that draws nothing at first (the lab field until its word is
 * sampled): call with false to keep the poster, then true once drawn.
 */
export function useGlyphReady(ready: boolean) {
  const set = React.use(ReadyContext);
  React.useLayoutEffect(() => set(ready), [set, ready]);
}

function AnchorScope({
  el,
  selfReady = false,
  children,
}: {
  el: () => HTMLElement | null;
  selfReady?: boolean;
  children: React.ReactNode;
}) {
  const [ready, setReady] = React.useState(!selfReady);
  const anchor = React.useMemo(() => ({ el }), [el]);
  useLiveFlag(el, ready);
  // Mounting commits after the frame that asked for it; draw once more.
  React.useLayoutEffect(() => kick(2), []);
  return (
    <AnchorContext value={anchor}>
      <ReadyContext value={setReady}>
        <GlyphCamera />
        {children}
      </ReadyContext>
    </AnchorContext>
  );
}

/** A placeholder's view: its element is `[data-scene-view="<id>"]`. */
export function ViewAnchor({
  id,
  selfReady,
  children,
}: {
  id: string;
  selfReady?: boolean;
  children: React.ReactNode;
}) {
  const cache = React.useRef<HTMLElement | null>(null);
  const el = React.useCallback(() => {
    if (!cache.current?.isConnected) {
      cache.current = document.querySelector<HTMLElement>(
        `[data-scene-view="${CSS.escape(id)}"]`
      );
    }
    return cache.current;
  }, [id]);
  return (
    <AnchorScope el={el} {...(selfReady !== undefined && { selfReady })}>
      {children}
    </AnchorScope>
  );
}

/**
 * View 0: the lead glyph the session canvas is lent to. Its element is the
 * slot, the `[data-glyph]` around the loader's host, and its kind is that
 * element's `data-glyph`. Remounted for each slot, so no state carries over.
 */
export function LeadAnchor({
  render,
}: {
  render: (kind: string) => React.ReactNode;
}) {
  const slot = useSceneSlot();
  // The session points the slot at the new host before it goes live.
  const target = React.useSyncExternalStore(
    sceneStore.subscribe,
    () =>
      sceneStore.getState().live
        ? (slot?.current.closest<HTMLElement>("[data-glyph]") ?? null)
        : null,
    () => null
  );
  const el = React.useCallback(
    () => (target?.isConnected ? target : null),
    [target]
  );

  const kind = target?.dataset.glyph;
  if (!target || !kind) return null;
  return (
    <AnchorScope key={keyOf(target)} el={el}>
      {render(kind)}
    </AnchorScope>
  );
}

let nextKey = 1;
const keys = new WeakMap<Element, number>();
function keyOf(el: Element) {
  let key = keys.get(el);
  if (key === undefined) {
    key = nextKey++;
    keys.set(el, key);
  }
  return key;
}

/* ---------------------------------------------------------------------------
 * Per-frame helpers.
 */

/** Whether motion is on, and the tier's allowance for pointer-driven tilt. */
export function motionState() {
  const motion = motionOn();
  return { motion, tilt: motion && sceneStore.getState().tier === 2 };
}

/**
 * The glyph's frame: `step(dt, el)` poses the pieces and returns whether
 * anything still moves, which keeps the clock awake for one more frame.
 */
export function useGlyphFrame(step: (dt: number, el: HTMLElement) => boolean) {
  const { el } = useAnchor();
  useFrame((_, delta) => {
    const target = el();
    if (!target) return;
    if (step(Math.min(delta, 1 / 30), target)) kick(2);
  });
}

/** Centre of `node` relative to the centre of `frame`, in the pixel camera. */
export function offsetIn(frame: DOMRect, node: Element) {
  return rectIn(frame, node.getBoundingClientRect());
}

/** {@link offsetIn} for a rect measured earlier. */
export function rectIn(frame: DOMRect, r: DOMRect) {
  return {
    x: r.left + r.width / 2 - (frame.left + frame.width / 2),
    y: frame.top + frame.height / 2 - (r.top + r.height / 2),
    width: r.width,
    height: r.height,
    shown: r.width > 0 && r.height > 0,
  };
}

/** The glyph's list anchors (`[data-glyph-anchor]`) in document order. */
export function anchorsOf(el: HTMLElement) {
  return [...el.querySelectorAll<HTMLElement>("[data-glyph-anchor]")];
}

/**
 * Pointer position over `region` relative to the glyph, -1..1 on each axis
 * (y up), for tilting toward the pointer. Fine pointers only.
 */
export function usePointerOver(region: (el: HTMLElement) => Element | null) {
  const { el } = useAnchor();
  const pointer = React.useRef({ x: 0, y: 0, inside: false });
  const regionRef = React.useRef(region);
  React.useEffect(() => {
    const glyph = el();
    const area = glyph && regionRef.current(glyph);
    if (!glyph || !area) return;
    const move = (e: Event) => {
      if (!(e instanceof PointerEvent) || e.pointerType === "touch") return;
      const r = glyph.getBoundingClientRect();
      const a = area.getBoundingClientRect();
      const half = Math.max(a.width, a.height) / 2 || 1;
      pointer.current.x = clamp((e.clientX - (r.left + r.width / 2)) / half);
      pointer.current.y = clamp((r.top + r.height / 2 - e.clientY) / half);
      pointer.current.inside = true;
      kick(2);
    };
    const leave = () => {
      pointer.current.inside = false;
      kick(2);
    };
    area.addEventListener("pointermove", move, { passive: true });
    area.addEventListener("pointerleave", leave);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, [el]);
  return pointer;
}

export const clamp = (v: number, a = -1, b = 1) => Math.min(b, Math.max(a, v));

/** Whether a `<details>` at or around `node` is open. */
export function isOpen(node: Element | null) {
  return node?.closest("details")?.open ?? false;
}

/** The hovered `data-scene-item` id, from the shared DOM contract. */
export function hovered() {
  return sceneStore.getState().hovered;
}

/** Wakes the clock on `event` at `target` for as long as the glyph is mounted. */
export function useWake(
  target: () => EventTarget | null,
  events: readonly string[]
) {
  const targetRef = React.useRef(target);
  const eventsRef = React.useRef(events);
  React.useEffect(() => {
    const node = targetRef.current();
    const names = eventsRef.current;
    if (!node) return;
    const wake = () => kick(2);
    for (const name of names) node.addEventListener(name, wake, true);
    return () => {
      for (const name of names) {
        node.removeEventListener(name, wake, true);
      }
    };
  }, []);
}

const euler = new Euler();
const quat = new Quaternion();
const at = new Vector3();
const size = new Vector3();

export type Place = {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  sx?: number;
  sy?: number;
  sz?: number;
};

/** Writes a translate-rotate-scale pose into `out` and returns it. */
export function place(out: Matrix4, p: Place): Matrix4 {
  return out.compose(
    at.set(p.x ?? 0, p.y ?? 0, p.z ?? 0),
    quat.setFromEuler(euler.set(p.rx ?? 0, p.ry ?? 0, p.rz ?? 0)),
    size.set(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1)
  );
}
