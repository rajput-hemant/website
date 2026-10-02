import type { BenchOptions } from "@/flavors/surface/components/scene/bench";
import {
  createStage,
  ease,
  finish,
  mount,
} from "@/flavors/surface/components/scene/workshop";
import type {
  Mounted,
  Part,
} from "@/flavors/surface/components/scene/workshop";
import {
  BoxGeometry,
  Color,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { tokenColor } from "@/lib/scene/colors";

/**
 * An LED bar-graph: `count` instanced segments in a rounded anodised tray,
 * each lit or dark from real data. A segment fades like the printed lamps
 * (about 150ms), then nothing renders.
 */
export type Bargraph = Mounted & { light: (lit: readonly boolean[]) => void };

const GAP = 2;

let cell: BoxGeometry | null = null;

type BargraphPart = Part & { lit: boolean[] };

function createBargraph(count: number, lit: readonly boolean[]): BargraphPart {
  const stage = createStage();
  cell ??= new BoxGeometry(1, 1, 1);
  const tray = new MeshStandardMaterial();
  const leds = new MeshBasicMaterial();
  const segments = new InstancedMesh(cell, leds, count);
  const trayMesh = new Mesh(undefined, tray);
  stage.root.add(trayMesh, segments);
  const levels = Array.from({ length: count }, (_, i) => ({
    x: lit[i] ? 1 : 0,
  }));
  const on = new Color();
  const off = new Color();
  const mix = new Color();
  const o = new Object3D();

  const part: BargraphPart = {
    stage,
    lit: [...lit],
    paint() {
      finish(tray, "anodised");
      on.set(tokenColor("--color-signal"));
      off.set(tokenColor("--color-led-off"));
    },
    resize(w, h) {
      trayMesh.geometry.dispose();
      trayMesh.geometry = new RoundedBoxGeometry(
        w,
        h,
        3,
        2,
        Math.min(3, h / 3)
      );
      const seg = (w - 2 * GAP - GAP * (count - 1)) / count;
      for (let i = 0; i < count; i++) {
        o.position.set(-w / 2 + GAP + seg / 2 + i * (seg + GAP), 0, 2);
        o.scale.set(Math.max(seg, 1), Math.max(h - 2 * GAP, 1), 1.5);
        o.updateMatrix();
        segments.setMatrixAt(i, o.matrix);
      }
      segments.instanceMatrix.needsUpdate = true;
    },
    step(dt) {
      let moving = false;
      for (let i = 0; i < count; i++) {
        const level = levels[i];
        if (!level) continue;
        if (ease(level, part.lit[i] ? 1 : 0, 20, dt)) moving = true;
        segments.setColorAt(i, mix.copy(off).lerp(on, level.x));
      }
      if (segments.instanceColor) segments.instanceColor.needsUpdate = true;
      return moving;
    },
  };
  return part;
}

const graphs = new Map<string, BargraphPart>();

/** A bar-graph of `lit.length` segments; the same `key` and count keeps its levels across pages. */
export function attachBargraph(
  host: HTMLElement,
  options: BenchOptions,
  key: string,
  lit: readonly boolean[]
): Bargraph {
  let part = graphs.get(key);
  if (!part || part.lit.length !== lit.length) {
    part = createBargraph(lit.length, lit);
    graphs.set(key, part);
  }
  const graph = part;
  graph.lit = [...lit];
  const mounted = mount(host, graph, options);
  return {
    ...mounted,
    light(next) {
      if (next.every((v, i) => v === graph.lit[i])) return;
      graph.lit = [...next];
      mounted.kick();
    },
  };
}
