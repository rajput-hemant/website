import {
  categoryYarn,
  KINDS,
  twill,
  type Draft,
  type Kind,
  type Loom,
  type Pick,
} from "@/flavors/jacquard/lib/weave";

import type { Update } from "@/lib/data/types";

/**
 * The cloth's route states and the weave it hangs with. No three.js here, so
 * the poster and the loader read the same numbers the scene uses.
 */
export type SceneRoute =
  | "home"
  | "projects"
  | "project"
  | "work"
  | "lab"
  | "about"
  | "now"
  | "ask"
  | "resume"
  | "notfound";

export type Pose = {
  /** Turn of the cloth on its rod, radians. */
  yaw: number;
  /** Pleat depth, 1 is the home drape. */
  drape: number;
  /** How many repeats of the weave fit across and down the cloth. */
  repeat: readonly [number, number];
  /** A broken end: this column of the weave hangs unwoven. */
  broken?: boolean;
};

export const poses: Record<SceneRoute, Pose> = {
  home: { yaw: -0.38, drape: 1, repeat: [2, 8] },
  projects: { yaw: -0.24, drape: 0.9, repeat: [2, 8] },
  project: { yaw: -0.3, drape: 0.8, repeat: [2, 2] },
  work: { yaw: 0.22, drape: 0.7, repeat: [1, 6] },
  lab: { yaw: 0.3, drape: 1.2, repeat: [2, 8] },
  about: { yaw: -0.16, drape: 0.8, repeat: [2, 8] },
  now: { yaw: 0.18, drape: 0.9, repeat: [2, 2] },
  ask: { yaw: -0.2, drape: 1.1, repeat: [2, 8] },
  resume: { yaw: 0.12, drape: 0.6, repeat: [2, 8] },
  notfound: { yaw: 0.42, drape: 1.5, repeat: [2, 8], broken: true },
};

/** The shared store holds any edition's route; this narrows it to ours. */
const isSceneRoute = (route: string): route is SceneRoute =>
  Object.hasOwn(poses, route);

export const asSceneRoute = (route: string): SceneRoute =>
  isSceneRoute(route) ? route : "home";

/**
 * What the cloth is woven from, passed to the scene through the slot's
 * `data-scene-board`. `ids` are the scene items a cell answers to (an end,
 * a role), each with its yarn; `rows` name what a row is, so hovering a pick
 * dyes every end it raises. `cells` is `w * h` characters: `.` where the
 * weft floats, else the base-36 index of the id raised there.
 */
export type Weave = {
  w: number;
  h: number;
  ids: string[];
  kinds: number[];
  rows: string[];
  cells: string;
};

const MAX_IDS = 36;

const kindIndex = (kind: Kind) => KINDS.indexOf(kind);
const cell = (id: number) => (id < 0 || id >= MAX_IDS ? "." : id.toString(36));

/** The whole draft: ends across, one row per pick. */
export function draftWeave(draft: Draft): Weave {
  return {
    w: Math.max(1, draft.ends.length),
    h: Math.max(1, draft.picks.length),
    ids: draft.ends.map((end) => `end:${end.index}`),
    kinds: draft.ends.map((end) => kindIndex(end.kind)),
    rows: draft.picks.map((pick) => `pick:${pick.index}`),
    cells: draft.picks.length
      ? draft.raised
          .map((row) => row.map((up, e) => cell(up ? e : -1)).join(""))
          .join("")
      : ".".repeat(Math.max(1, draft.ends.length)),
  };
}

/** One project's twill: its pick, stepped one end per row. */
export function twillWeave(draft: Draft, pick: Pick | undefined): Weave {
  const cells = twill(draft, pick);
  return {
    w: cells[0]?.length ?? 1,
    h: cells.length,
    ids: draft.ends.map((end) => `end:${end.index}`),
    kinds: draft.ends.map((end) => kindIndex(end.kind)),
    rows: [],
    cells: cells.map((row) => row.map(cell).join("")).join("") || ".",
  };
}

/** The roles as threads: months across, one row per role, in its thread's yarn. */
export function threadWeave(loom: Loom, months = 28): Weave {
  const rows = loom.rows.slice(0, MAX_IDS);
  return {
    w: months,
    h: Math.max(1, rows.length),
    ids: rows.map((row) => `role:${row.role.id}`),
    kinds: rows.map((row) => kindIndex(row.yarn)),
    rows: rows.map((row) => `role:${row.role.id}`),
    cells:
      rows
        .map((row, i) =>
          Array.from({ length: months }, (_, m) => {
            const at = (m + 0.5) / months;
            const on = at >= row.start && at <= row.start + row.length;
            // A plain weave inside the role: every other end floats.
            return cell(on && (m + i) % 2 === 0 ? i : -1);
          }).join("")
        )
        .join("") || ".",
  };
}

/** The loom log: one pick per entry, newest at the top, a plain weave in its category's yarn. */
export function logWeave(entries: readonly Update[], ends = 24): Weave {
  const kinds = KINDS.map((kind) => kindIndex(kind));
  const rows = entries.slice(0, 24);
  return {
    w: ends,
    h: Math.max(1, rows.length),
    ids: KINDS.map((kind) => `yarn:${kind}`),
    kinds,
    rows: [],
    cells:
      rows
        .map((entry, y) =>
          Array.from({ length: ends }, (_, x) =>
            cell(
              (x + y) % 2 === 0 ? kindIndex(categoryYarn[entry.category]) : -1
            )
          ).join("")
        )
        .join("") || ".",
  };
}

export function encodeWeave(weave: Weave): string {
  return JSON.stringify(weave);
}

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((v) => typeof v === "number");
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

/** Reads a board back, or null when it is missing or malformed. */
export function decodeWeave(value: string | null | undefined): Weave | null {
  if (!value) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("w" in parsed && "h" in parsed && "ids" in parsed) ||
    !("kinds" in parsed && "rows" in parsed && "cells" in parsed)
  ) {
    return null;
  }
  const { w, h, ids, kinds, rows, cells } = parsed;
  if (
    typeof w !== "number" ||
    typeof h !== "number" ||
    w < 1 ||
    h < 1 ||
    !isStringArray(ids) ||
    !isNumberArray(kinds) ||
    !isStringArray(rows) ||
    typeof cells !== "string" ||
    cells.length !== w * h
  ) {
    return null;
  }
  return { w, h, ids, kinds, rows, cells };
}

/** The id index raised at cell `x, y`, or -1. */
export function cellAt(weave: Weave, x: number, y: number): number {
  const c = weave.cells[y * weave.w + x];
  return c === undefined || c === "." ? -1 : parseInt(c, 36);
}

/**
 * Which ids light when `hovered` is pointed at: the id itself, or every id a
 * named row raises (a pick lights all its ends, across every row).
 */
export function hotIds(weave: Weave, hovered: string | null): Set<number> {
  const hot = new Set<number>();
  if (!hovered) return hot;
  const id = weave.ids.indexOf(hovered);
  if (id >= 0) hot.add(id);
  const row = weave.rows.indexOf(hovered);
  if (row >= 0) {
    for (let x = 0; x < weave.w; x++) {
      const at = cellAt(weave, x, row);
      if (at >= 0) hot.add(at);
    }
  }
  return hot;
}
