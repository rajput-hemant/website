import { model, type Solid } from "@/flavors/survey/components/scene/models";
import {
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  type BufferGeometry,
} from "three";

import type { ProjectStatus } from "@/lib/data/types";
import type { Glyph, GlyphOptions } from "@/lib/scene/blit";
import { tokenColor } from "@/lib/scene/colors";

import { glyphs } from "./engine";

const DEG = Math.PI / 180;
/** Half the glyph's world width: the tallest model (the antiquity's 10) and its pad, framed. */
const EXTENT = 7;
const ELEVATION = 24 * DEG;
/** Where a glyph rests, turned so two faces of the pillar show. */
const REST = 22;
/** Degrees of spin per CSS pixel dragged. */
const PER_PX = 1.4;
/** Inertia after a drag: velocity kept per 16ms. */
const FRICTION = 0.92;
const LEAN = 8;

/** Each condition's model and inks, after the key's symbols (`SiteSymbol`). */
const LOOKS: Record<
  ProjectStatus,
  { solid: Solid; fill: Ink; edge: Ink; dashed: boolean }
> = {
  active: { solid: "pillar", fill: "ink", edge: "sheet", dashed: false },
  maintained: { solid: "pillar", fill: "sheet", edge: "ink", dashed: false },
  archived: { solid: "antiquity", fill: "ink", edge: "sheet", dashed: false },
  wip: { solid: "works", fill: "sheet", edge: "ink", dashed: true },
};

type Ink = "ink" | "sheet";

/** Materials and geometry shared by every monument on the page. */
let kit: ReturnType<typeof createKit> | null = null;

function createKit() {
  const fills: Record<Ink, MeshBasicMaterial> = {
    // Faces sit a hair behind their edges.
    ink: new MeshBasicMaterial({
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    sheet: new MeshBasicMaterial({
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  };
  const edges: Record<Ink, LineBasicMaterial> = {
    ink: new LineBasicMaterial(),
    sheet: new LineBasicMaterial(),
  };
  const dashed = new LineDashedMaterial({ dashSize: 1.2, gapSize: 0.9 });
  const pad = new LineBasicMaterial({ transparent: true, opacity: 0.7 });
  const padGeometry = new EdgesGeometry(
    new PlaneGeometry(9, 9).rotateX(-Math.PI / 2)
  );
  const solids = new Map<
    Solid,
    { fill: BufferGeometry; edges: EdgesGeometry }
  >();
  const solid = (kind: Solid) => {
    const found = solids.get(kind);
    if (found) return found;
    const fill = model(kind);
    const made = { fill, edges: new EdgesGeometry(fill, 15) };
    solids.set(kind, made);
    return made;
  };
  const paint = () => {
    const ink = tokenColor("--color-ink", "#1c2a2b");
    const sheet = tokenColor("--color-sheet", "#ebefe7");
    fills.ink.color.set(ink);
    fills.sheet.color.set(sheet);
    edges.ink.color.set(ink);
    edges.sheet.color.set(sheet);
    dashed.color.set(ink);
    pad.color.set(tokenColor("--color-ink-faint", "#536361"));
  };
  return { fills, edges, dashed, pad, padGeometry, solid, paint };
}

const motionOn = () => document.documentElement.dataset.motion === "on";

/** Critically damped spring in degrees (about 180ms), as the props' lift. */
function spring(s: { x: number; v: number }, target: number, dt: number) {
  for (let t = dt; t > 0; t -= 1 / 120) {
    const h = Math.min(t, 1 / 120);
    s.v += (380 * (target - s.x) - 32 * s.v) * h;
    s.x += s.v * h;
  }
  if (Math.abs(s.v) < 0.05 && Math.abs(target - s.x) < 0.05) {
    s.x = target;
    s.v = 0;
    return false;
  }
  return true;
}

export type Monument = {
  /** Detach the glyph; the poster comes back. */
  detach(): void;
  /** A pointer took hold: the monument turns under it. */
  grab(clientX: number): void;
  drag(clientX: number): void;
  /** Let go: it coasts on (with motion on) and slows to a stop. */
  release(): void;
  /** Lean toward the pointer, -1 to 1 across the glyph; (0, 0) stands it up. */
  lean(x: number, y: number): void;
  /** Turn to `degrees` past its rest (a spring), or 0 to go back. */
  aim(degrees: number): void;
};

/**
 * A condition monument, the map symbol stood up in 3D: a trig pillar, an
 * antiquity's cross or a works box on a faint pad, unlit, in the sheet's
 * ink and paper. Drawn by the page's blit engine into a canvas it appends to
 * `host`; it renders only while it turns or leans. `onRest` runs each time
 * it comes to rest.
 */
export function attachMonument(
  host: HTMLElement,
  status: ProjectStatus,
  options: GlyphOptions & { onRest?: () => void }
): Monument {
  const k = (kit ??= createKit());
  const look = LOOKS[status];
  const parts = k.solid(look.solid);

  const scene = new Scene();
  const lean = new Group();
  const turn = new Group();
  scene.add(lean);
  lean.add(turn);
  turn.add(new LineSegments(k.padGeometry, k.pad));
  turn.add(new Mesh(parts.fill, k.fills[look.fill]));
  const outline = new LineSegments(
    parts.edges,
    look.dashed ? k.dashed : k.edges[look.edge]
  );
  if (look.dashed) outline.computeLineDistances();
  turn.add(outline);

  const camera = new OrthographicCamera(
    -EXTENT,
    EXTENT,
    EXTENT,
    -EXTENT,
    0.1,
    100
  );
  camera.position.set(
    0,
    4.5 + Math.sin(ELEVATION) * 40,
    Math.cos(ELEVATION) * 40
  );
  camera.lookAt(0, 4.5, 0);

  const yaw = { x: REST, v: 0 };
  const tilt = { x: { x: 0, v: 0 }, z: { x: 0, v: 0 } };
  const target = { yaw: REST, x: 0, z: 0 };
  let spin = 0;
  let held: {
    x: number;
    t: number;
    samples: { dx: number; t: number }[];
  } | null = null;
  let coasting = false;

  const glyph: Glyph = {
    scene,
    camera,
    paint: k.paint,
    step: (dt) => {
      const motion = motionOn();
      let moving = false;
      if (held) {
        yaw.v = 0;
      } else if (coasting) {
        yaw.x += spin * dt;
        spin *= Math.pow(FRICTION, dt / 0.016);
        if (Math.abs(spin) < 4) {
          spin = 0;
          coasting = false;
          target.yaw = yaw.x;
        } else moving = true;
      } else if (!motion) {
        yaw.x = target.yaw;
        yaw.v = 0;
      } else if (spring(yaw, target.yaw, dt)) moving = true;

      const lx = motion ? target.x : 0;
      const lz = motion ? target.z : 0;
      if (!motion) {
        tilt.x.x = lx;
        tilt.z.x = lz;
      } else {
        if (spring(tilt.x, lx, dt)) moving = true;
        if (spring(tilt.z, lz, dt)) moving = true;
      }

      turn.rotation.y = yaw.x * DEG;
      lean.rotation.set(tilt.x.x * DEG, 0, tilt.z.x * DEG);
      if (!moving) queueMicrotask(() => options.onRest?.());
      return moving;
    },
  };

  const detach = glyphs.attach(host, glyph, options);
  const kick = () => glyphs.kick(glyph);

  return {
    detach,
    grab(clientX) {
      held = { x: clientX, t: performance.now(), samples: [] };
      coasting = false;
      spin = 0;
      kick();
    },
    drag(clientX) {
      if (!held) return;
      const now = performance.now();
      const dx = clientX - held.x;
      held.samples.push({ dx, t: now });
      held.samples = held.samples.filter((s) => now - s.t < 90);
      held.x = clientX;
      held.t = now;
      yaw.x += dx * PER_PX;
      target.yaw = yaw.x;
      kick();
    },
    release() {
      if (!held) return;
      const recent = held.samples;
      held = null;
      const first = recent[0];
      const span = first ? (performance.now() - first.t) / 1000 : 0;
      const moved = recent.reduce((sum, s) => sum + s.dx, 0);
      // With motion off it stops where it was let go.
      spin =
        motionOn() && span > 0 ? (moved * PER_PX) / Math.max(span, 1 / 60) : 0;
      coasting = spin !== 0;
      target.yaw = yaw.x;
      kick();
    },
    lean(x, y) {
      target.z = -x * LEAN;
      target.x = y * LEAN;
      kick();
    },
    aim(degrees) {
      held = null;
      coasting = false;
      spin = 0;
      target.yaw = REST + degrees;
      kick();
    },
  };
}
