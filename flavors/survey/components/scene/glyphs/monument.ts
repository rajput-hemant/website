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
import { createTurntable, DEG, turntableHandle, type Handle } from "./kit";

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

/** Detach, drag, lean and aim: the turntable handle every glyph shares. */
export type Monument = Handle;

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

  const table = createTurntable({
    rest: REST,
    perPx: PER_PX,
    friction: FRICTION,
    lean: LEAN,
  });

  const glyph: Glyph = {
    scene,
    camera,
    paint: k.paint,
    step: (dt) => {
      const moving = table.step(dt);
      turn.rotation.y = table.yaw * DEG;
      lean.rotation.set(table.tiltX * DEG, 0, table.tiltZ * DEG);
      if (!moving) queueMicrotask(() => options.onRest?.());
      return moving;
    },
  };

  const detach = glyphs.attach(host, glyph, options);
  return turntableHandle(table, () => glyphs.kick(glyph), detach);
}
