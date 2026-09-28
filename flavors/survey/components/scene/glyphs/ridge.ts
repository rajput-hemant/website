import type { OpenOptions } from "@/flavors/survey/components/scene/use-glyph";
import { SHEET } from "@/flavors/survey/lib/relief";
import {
  BLOCK_BASE,
  BLOCK_W,
  blockDepth,
  blockFrame,
  blockHeights,
  RIDGE_RANGE,
  RIDGE_VIEW,
  STAKE_H,
  tintIndex,
  toWorld,
  worldHeight,
  type BlockSpec,
} from "@/flavors/survey/lib/ridge-block";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  Scene,
} from "three";

import type { Glyph } from "@/lib/scene/blit";

import { model } from "../models";
import { glyphs } from "./engine";
import {
  createTurntable,
  DEG,
  disposeGeometry,
  glyphCamera,
  glyphInks,
  outlined,
  turntableHandle,
  type Handle,
} from "./kit";

/**
 * The ground's top: a displaced grid in the stepped tints, its index
 * contours (every 8 months) laid on it, and the skirts down to the base.
 */
function build(spec: BlockSpec) {
  const heights = blockHeights(spec);
  const cols = spec.nx + 1;
  const d = blockDepth(spec);
  const gx = (i: number) => (i / spec.nx - 0.5) * BLOCK_W;
  const gz = (j: number) => (j / spec.np - 0.5) * d;
  const h = (i: number, j: number) => heights[j * cols + i] ?? 0;
  const y = (i: number, j: number) => worldHeight(spec, h(i, j));

  const top = new BufferGeometry();
  const pos: number[] = [];
  for (let j = 0; j <= spec.np; j++) {
    for (let i = 0; i <= spec.nx; i++) pos.push(gx(i), y(i, j), gz(j));
  }
  const index: number[] = [];
  for (let j = 0; j < spec.np; j++) {
    for (let i = 0; i < spec.nx; i++) {
      const a = j * cols + i;
      index.push(a, a + cols, a + 1, a + 1, a + cols, a + cols + 1);
    }
  }
  top.setAttribute("position", new Float32BufferAttribute(pos, 3));
  top.setAttribute(
    "color",
    new Float32BufferAttribute(new Float32Array(pos.length), 3)
  );
  top.setIndex(index);

  // Index contours by marching squares on the grid, a hair above the ground.
  const lines: number[] = [];
  const lift = 0.03;
  for (let level = SHEET.INDEX; level < spec.tallest; level += SHEET.INDEX) {
    for (let j = 0; j < spec.np; j++) {
      for (let i = 0; i < spec.nx; i++) {
        const corners: [number, number][] = [
          [i, j],
          [i + 1, j],
          [i + 1, j + 1],
          [i, j + 1],
        ];
        const cut: number[] = [];
        for (let k = 0; k < 4; k++) {
          const [ai, aj] = corners[k] ?? [0, 0];
          const [bi, bj] = corners[(k + 1) % 4] ?? [0, 0];
          const ha = h(ai, aj);
          const hb = h(bi, bj);
          if (ha < level === hb < level) continue;
          const t = (level - ha) / (hb - ha);
          cut.push(
            gx(ai) + (gx(bi) - gx(ai)) * t,
            worldHeight(spec, level) + lift,
            gz(aj) + (gz(bj) - gz(aj)) * t
          );
        }
        // Two crossings make a segment; a saddle's four make two.
        for (let k = 0; k + 5 < cut.length; k += 6) {
          lines.push(...cut.slice(k, k + 6));
        }
      }
    }
  }
  const contours = new BufferGeometry();
  contours.setAttribute("position", new Float32BufferAttribute(lines, 3));

  // Skirts: one wall per side, from the ground's edge down to the base.
  const wall: number[] = [];
  const quad = (
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
  ) => {
    const b = -BLOCK_BASE;
    wall.push(x1, y1, z1, x1, b, z1, x2, y2, z2);
    wall.push(x2, y2, z2, x1, b, z1, x2, b, z2);
  };
  for (let i = 0; i < spec.nx; i++) {
    quad(
      gx(i),
      y(i, spec.np),
      gz(spec.np),
      gx(i + 1),
      y(i + 1, spec.np),
      gz(spec.np)
    );
    quad(gx(i + 1), y(i + 1, 0), gz(0), gx(i), y(i, 0), gz(0));
  }
  for (let j = 0; j < spec.np; j++) {
    quad(
      gx(spec.nx),
      y(spec.nx, j + 1),
      gz(j + 1),
      gx(spec.nx),
      y(spec.nx, j),
      gz(j)
    );
    quad(gx(0), y(0, j), gz(j), gx(0), y(0, j + 1), gz(j + 1));
  }
  const skirts = new BufferGeometry();
  skirts.setAttribute("position", new Float32BufferAttribute(wall, 3));

  return { top, contours, skirts, heights };
}

/**
 * A block diagram glyph: the cut of the relief described by `spec`, drawn
 * unlit in the sheet's tints with its index contours and ink skirts. W2
 * (a role's ridge, beside its transect) turns under a drag up to 30 degrees
 * either side and springs back when let go, and leans 6 degrees toward the
 * mouse; L2 (a trial's pit) follows the card's tilt through `aim` and
 * `lean`. With motion off it holds its resting view and moves only under
 * the drag. The root `Group` is the one inspectable object.
 */
export function attachRidge(
  host: HTMLElement,
  spec: BlockSpec,
  options: OpenOptions & { aspect: number }
): Handle {
  const inks = glyphInks();
  const parts = build(spec);

  const scene = new Scene();
  const lean = new Group();
  const root = new Group();
  scene.add(lean);
  lean.add(root);
  root.add(new Mesh(parts.top, inks.ground));
  root.add(new LineSegments(parts.contours, inks.lines.contour));
  root.add(outlined(parts.skirts, inks.fills.sheet, inks.lines.ink, 30));

  if (spec.stake) {
    const [sx, sp] = spec.stake;
    const at = toWorld(spec, sx, sp);
    const ground = worldHeight(
      spec,
      parts.heights[
        Math.round(((sp - spec.p0) / (spec.p1 - spec.p0)) * spec.np) *
          (spec.nx + 1) +
          Math.round(((sx - spec.x0) / (spec.x1 - spec.x0)) * spec.nx)
      ] ?? 0
    );
    // The props' stake and tape, scaled up to read at glyph size.
    const stake = new Group();
    stake.add(outlined(model("stake"), inks.fills.wood, inks.lines.ink));
    const tape = new Mesh(model("tape").translate(0, 9, 0), inks.fills.contour);
    stake.add(tape);
    // The props' stake is 10 units tall.
    stake.scale.setScalar(STAKE_H / 10);
    stake.position.set(at.x, ground, at.z);
    root.add(stake);
  }

  const paintTop = () => {
    const colors = parts.top.getAttribute("color");
    parts.heights.forEach((h, k) => {
      const c = inks.tints[tintIndex(spec, h)];
      if (c) colors.setXYZ(k, c.r, c.g, c.b);
    });
    colors.needsUpdate = true;
  };
  const offPaint = inks.onPaint(paintTop);

  const frame = blockFrame(spec, options.aspect);
  const camera = glyphCamera(
    frame.extent,
    RIDGE_VIEW.elevation,
    frame.lookY,
    options.aspect
  );
  const table = createTurntable({
    rest: RIDGE_VIEW.yaw,
    perPx: 0.6,
    friction: 0,
    lean: 6,
    range: RIDGE_RANGE,
  });

  const glyph: Glyph = {
    scene,
    camera,
    paint: () => {
      inks.paint();
      paintTop();
    },
    step: (dt) => {
      const moving = table.step(dt);
      root.rotation.y = table.yaw * DEG;
      lean.rotation.set(table.tiltX * DEG, 0, table.tiltZ * DEG);
      if (!moving) queueMicrotask(() => options.onRest?.());
      return moving;
    },
  };

  const detach = glyphs.attach(host, glyph, options);
  return turntableHandle(
    table,
    () => glyphs.kick(glyph),
    () => {
      detach();
      offPaint();
      disposeGeometry(root);
    }
  );
}
