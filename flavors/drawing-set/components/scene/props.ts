import {
  entriesFor,
  pageState,
  type PageEntry,
} from "@/flavors/drawing-set/lib/scene/page-state";
import { penAt } from "@/flavors/drawing-set/lib/scene/plot";
import {
  CHEST,
  DH,
  drawers,
  drawerY,
  poses,
  TRAY,
  type SceneRoute,
} from "@/flavors/drawing-set/lib/scene/poses";
import { reach } from "@/flavors/drawing-set/lib/scene/reach";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";

import { kick } from "@/lib/scene/clock";
import { input, sceneStore, type SceneItem } from "@/lib/scene/store";

import { Linework } from "./linework";
import * as M from "./models";

type Vec3 = [number, number, number];

/** The pose's prop stage as a parent matrix: scale about `at`, then `lift`. */
export function stage(route: SceneRoute) {
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

/**
 * What a pointer over a mesh instance stands for: a store id, where a click
 * goes, and the destination's name for the scene's tag (else the page item's
 * `data-scene-label`).
 */
export type Hit = {
  id: string | null;
  href: string | null;
  label?: string | undefined;
};

/** The world's helpers the props share, so they move and settle like the rest. */
export type PropContext = {
  place: (
    lw: Linework,
    i: number,
    pos: Vec3,
    rot?: Vec3,
    scale?: Vec3,
    parent?: Matrix4
  ) => void;
  /** Damped approach; reports motion to the sleeping clock. */
  approach: (cur: number, target: number, k: number, dt: number) => number;
  presence: (route: SceneRoute) => number;
  /** Keeps the clock awake this frame for motion that is not an approach. */
  busy: () => void;
};

export type PropFrame = {
  route: SceneRoute;
  dt: number;
  hovered: string | null;
  /** The drawer the hover points at, if any (see `pointedDrawer`). */
  pointed: string | null;
  items: readonly SceneItem[];
  /** Damped scroll progress through the page's section, 0..1. */
  progress: number;
  /** How far each drawer is pulled out. */
  open: Float32Array;
  motion: boolean;
};

/** The now drawer's revision cloud, as world.tsx builds and places it. */
export const CLOUD = { w: CHEST.W + 0.35, h: DH + 0.35 } as const;

/** Home: the drafting machine's head, which links to the register. */
const HEAD: Hit = { id: "arm:head", href: "/projects", label: "Register" };

/** The A4 as it lies on the board (world.tsx places the sheet itself there). */
export const A4 = new Matrix4()
  .compose(
    new Vector3(0, 0.034, 0),
    new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0)),
    new Vector3(1.5, 1.5, 1.5)
  )
  .premultiply(M.board);

/** Resume: the document's sections, as `data-scene-item="section:*"`. */
const sections = (items: readonly SceneItem[]) =>
  items.filter((it) => it.id.startsWith("section:"));

/** Projects: SUPERSEDED (archived) drawings, rolled into tubes on the board. */
const superseded = (): readonly PageEntry[] =>
  (entriesFor("projects") ?? [])
    .filter((entry) => entry.kind === "archived")
    .slice(0, 6);

const hitOf = (entry: PageEntry | undefined): Hit => ({
  id: entry?.id ?? null,
  href: entry?.href ?? null,
  label: entry?.label,
});

/**
 * The route props that ride the session canvas beside the chest and table
 * (audit appendix B slice 4). Each is linework in the existing slot and
 * reads only store state and page state, so the clock still sleeps once
 * they settle.
 */
export function createProps({ place, approach, presence, busy }: PropContext) {
  const links = new Linework(M.bar(), 2);
  const head = new Linework(M.machineHead(), 1, true);

  const tubes = new Linework(M.tube(), 6, true);
  const roll = new Float32Array(tubes.max);

  const square = new Linework(M.tSquare());
  const triangle = new Linework(M.setSquare());

  const pinned = new Linework(M.slip(), 9);
  const pinHead = new Linework(M.pin());
  const lifted = new Float32Array(pinned.max);
  const rfiBoard = new Matrix4().copy(M.board).premultiply(stage("rfi"));

  const dividers = new Linework(M.dividerLeg(), 2);
  let span = 0.06;

  const blocks = new Linework(M.sectionBlock(), 6, true);
  const inked = new Float32Array(blocks.max);

  const misfiled = new Linework(M.sheet(), 4, true);
  const picked = new Float32Array(misfiled.max);
  const glass = new Linework(M.loupe());
  const lens = { x: 0, z: 0 };

  const rods = new Linework(M.rod(), 3);
  const pen = new Linework(M.carriage());
  // The now cloud plots in once per visit, and again when the log's filter changes.
  let plot = 0;
  const offPage = pageState.subscribe((s, prev) => {
    // A filter change republishes the log's entries (clearing them first).
    if (s.route === "now" && s.entries !== prev.entries) {
      plot = 0;
      kick();
    }
  });

  // The arm's head in board coordinates, and its turn about the board normal.
  const arm = { x: 0.55, z: -0.5, a: -0.25, hot: 0 };

  function frame(f: PropFrame) {
    const pHome = presence("home");
    if (pHome > 0) {
      // Aim at the pointed drawer (top drawers are the board's far side), else at A.
      const k = Math.max(
        0,
        drawers.findIndex((d) => d.id === f.pointed)
      );
      arm.x = approach(arm.x, 0.55 - k * 0.04, 6, f.dt);
      arm.z = approach(arm.z, -0.5 + k * 0.16, 6, f.dt);
      arm.a = approach(arm.a, -0.25 + k * 0.08, 6, f.dt);
      arm.hot = approach(arm.hot, f.hovered === HEAD.id ? 1 : 0, 10, f.dt);
      const base = { x: -1.45, z: -0.95 };
      const { elbow, tip } = reach(
        arm.x - base.x,
        arm.z - base.z,
        1.35,
        1.25,
        -1
      );
      const y = 0.07;
      const segment = (i: number, from: number[], to: number[]) => {
        const dx = (to[0] ?? 0) - (from[0] ?? 0);
        const dz = (to[1] ?? 0) - (from[1] ?? 0);
        place(
          links,
          i,
          [base.x + (from[0] ?? 0), y, base.z + (from[1] ?? 0)],
          [0, Math.atan2(-dz, dx), 0],
          [Math.hypot(dx, dz), 1, 1],
          M.board
        );
      };
      segment(0, [0, 0], elbow);
      segment(1, elbow, tip);
      place(
        head,
        0,
        [base.x + tip[0], y + 0.02, base.z + tip[1]],
        [0, arm.a, 0],
        [1, 1, 1],
        M.board
      );
      head.setHot(0, arm.hot);
      links.setHot(0, arm.hot * 0.4);
      links.setHot(1, arm.hot * 0.4);
    }
    links.commit(pHome);
    head.commit(pHome);

    const pProjects = presence("projects");
    if (pProjects > 0) {
      const rolled = superseded();
      tubes.setCount(rolled.length);
      rolled.forEach((entry, i) => {
        const on = f.hovered === entry.id;
        const r = (roll[i] = approach(roll[i]!, on ? 1 : 0, 9, f.dt));
        place(
          tubes,
          i,
          [
            0.35 + (i % 2) * 0.05,
            0.1 + Math.floor(i / 2) * 0.001,
            -0.8 + i * 0.15,
          ],
          [0.3 + r * (Math.PI / 6), 0.08 - (i % 3) * 0.04, 0],
          [1, 1, 1],
          M.board
        );
        tubes.setHot(i, r);
      });
    }
    tubes.commit(pProjects);

    // Project: the T-square slides down the board as the case study scrolls,
    // and the set square rides along its blade.
    const pProject = presence("project");
    if (pProject > 0) {
      const z = -0.75 + f.progress * 1.4;
      place(square, 0, [-1.6, 0.06, z], [0, 0, 0], [1, 1, 1], M.board);
      place(
        triangle,
        0,
        [-1.1 + f.progress * 1.7, 0.07, z + 0.06],
        [0, 0, 0],
        [1, 1, 1],
        M.board
      );
    }
    square.commit(pProject);
    triangle.commit(pProject);

    // Now: a plotter gantry over the revision cloud, its pen on the line as it draws.
    const pNow = presence("now");
    if (pNow > 0 && f.route === "now") {
      if (plot < 1) {
        plot = f.motion ? Math.min(1, plot + f.dt / 1.4) : 1;
        busy();
      }
    } else if (pNow === 0) {
      plot = 0;
    }
    if (pNow > 0) {
      const { w, h } = CLOUD;
      const y = drawerY(4);
      const z = CHEST.D / 2 + 0.2 + f.open[4]!;
      const [px, py] = plot < 1 ? penAt(plot, w, h) : [-w / 2, -h / 2];
      place(rods, 0, [-w / 2 - 0.14, y, z], [0, 0, 0], [0.03, h + 0.3, 0.03]);
      place(rods, 1, [w / 2 + 0.14, y, z], [0, 0, 0], [0.03, h + 0.3, 0.03]);
      place(rods, 2, [0, y + py, z], [0, 0, 0], [w + 0.34, 0.035, 0.035]);
      place(pen, 0, [px, y + py, z + 0.02]);
      pen.setHot(0, plot < 1 ? 1 : 0);
    }
    rods.commit(pNow);
    pen.commit(pNow);

    // RFI permalink: the thread's slip pinned to the board, a slip per reply
    // shingled under it; hovering a reply lifts its slip.
    const pRfi = presence("rfi");
    if (pRfi > 0) {
      const replies = f.items.filter((it) => it.id.startsWith("reply:"));
      const n = Math.min(pinned.max, replies.length + 1);
      pinned.setCount(n);
      for (let i = 0; i < n; i++) {
        const id = i ? replies[i - 1]?.id : null;
        const l = (lifted[i] = approach(
          lifted[i]!,
          id && f.hovered === id ? 1 : 0,
          9,
          f.dt
        ));
        place(
          pinned,
          i,
          [
            TRAY[0] + (((i * 37) % 5) - 2) * 0.015,
            0.036 + 0.004 * i + l * 0.12,
            TRAY[2] - 0.45 + i * 0.2,
          ],
          [0, (((i * 29) % 7) - 3) * 0.02, 0],
          [1, 1, 1],
          rfiBoard
        );
        pinned.setHot(i, i === 0 ? 0.6 : l);
      }
      place(
        pinHead,
        0,
        [TRAY[0] - 0.55, 0.05, TRAY[2] - 0.8],
        [0, 0, 0],
        [1, 1, 1],
        rfiBoard
      );
      pinHead.setHot(0, 1);
    }
    pinned.commit(pRfi);
    pinHead.commit(pRfi);

    // Lab: dividers on the chest top open to the hovered study's footprint.
    const pLab = presence("lab");
    if (pLab > 0) {
      const study = f.hovered?.startsWith("study:") ?? false;
      span = approach(span, study ? 0.62 : 0.06, 7, f.dt);
      const leg = 0.7;
      const a = Math.asin(Math.min(1, span / 2 / leg));
      const at: Vec3 = [
        CHEST.W / 2 - 0.4,
        CHEST.H / 2 + 0.08 + leg * Math.cos(a),
        CHEST.D / 2 - 0.25,
      ];
      place(dividers, 0, at, [0, 0, a]);
      place(dividers, 1, at, [0, 0, -a]);
      dividers.setHot(0, study ? 1 : 0);
      dividers.setHot(1, study ? 1 : 0);
    }
    dividers.commit(pLab);

    // Resume: the A4's ruled blocks are the document's sections, sized by
    // their entries; the section in view (or hovered) is redlined.
    let active: string | null | undefined;
    const pResume = presence("resume");
    if (pResume > 0) {
      const list = sections(f.items);
      const n = Math.min(blocks.max, list.length);
      const total = list.reduce((sum, it) => sum + it.weight, 0) || 1;
      const current = list.findIndex((it) => it.id === f.hovered);
      const lit =
        current >= 0 ? current : Math.min(n - 1, Math.floor(f.progress * n));
      if (f.route === "resume") active = list[lit]?.id ?? null;
      const gap = 0.035;
      const usable = 0.84 - gap * Math.max(0, n - 1);
      let y = 0.44;
      blocks.setCount(n);
      for (let i = 0; i < n; i++) {
        const h = (usable * (list[i]?.weight ?? 1)) / total;
        const k = (inked[i] = approach(inked[i]!, i === lit ? 1 : 0, 9, f.dt));
        place(blocks, i, [-0.02, y, 0.006], [0, 0, 0], [1, h, 1], A4);
        blocks.setHot(i, k);
        y -= h + gap;
      }
    }
    blocks.commit(pResume);

    // 404: the nav's sheets lie misfiled on the floor in front of the chest,
    // and a loupe follows the pointer over the empty drawer.
    const pMissing = presence("notfound");
    if (pMissing > 0) {
      const floor = -CHEST.H / 2 - 0.45 + 0.004;
      for (let i = 0; i < misfiled.max; i++) {
        const on = f.hovered === drawers[i]?.id;
        const l = (picked[i] = approach(picked[i]!, on ? 1 : 0, 9, f.dt));
        place(
          misfiled,
          i,
          [-3.5 + i * 0.5, floor + l * 0.12, 1.5 + (i % 2) * 0.4],
          [-Math.PI / 2 + l * 0.25, 0, ((i * 47) % 7) * 0.12 - 0.36],
          [1, 1, 1]
        );
        misfiled.setHot(i, l);
      }
      const k = 7;
      const inside = input.inside && f.motion;
      lens.x = approach(lens.x, inside ? input.px * 1.3 : 0, 6, f.dt);
      lens.z = approach(lens.z, inside ? -input.py * 0.6 : 0, 6, f.dt);
      place(glass, 0, [
        lens.x,
        drawerY(k) - DH * 0.15 + DH * 0.275 + 0.08,
        lens.z + f.open[k]!,
      ]);
      glass.setHot(0, 1);
    }
    misfiled.commit(pMissing);
    glass.commit(pMissing);

    return { plot: pNow > 0 ? plot : 1, active };
  }

  return {
    lineworks: [
      links,
      head,
      tubes,
      square,
      triangle,
      rods,
      pen,
      pinned,
      pinHead,
      dividers,
      blocks,
      misfiled,
      glass,
    ],
    /** Interactive props: the mesh proxy and what each instance stands for. */
    pickable: [
      { lw: head, pick: (): Hit => HEAD },
      { lw: tubes, pick: (i: number): Hit => hitOf(superseded()[i]) },
      {
        lw: misfiled,
        pick: (i: number): Hit => ({
          id: drawers[i]?.id ?? null,
          href: drawers[i]?.href ?? null,
          label: drawers[i]?.label,
        }),
      },
      {
        lw: blocks,
        pick: (i: number): Hit => {
          const it = sections(sceneStore.getState().items)[i];
          return { id: it?.id ?? null, href: it?.href ?? null };
        },
      },
    ],
    frame,
    dispose: offPage,
  };
}
