/**
 * Split-flap board text. A real module can only show what is printed on its
 * drum, so every string is fitted to the drum and to a fixed cell count
 * before it reaches the DOM board or the 3D indicator.
 */
import type { ProjectStatus } from "@/lib/data/types";

/** The drum of one module, in the order the flaps turn: blank first. */
export const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-/&'";

/** Uppercases, folds accents and swaps anything off the drum for a space. */
export function toDrum(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .split("")
    .map((char) => (DRUM.includes(char) ? char : " "))
    .join("")
    .trim();
}

/**
 * `text` on `cells` modules: whole words while they fit, then a hard cut,
 * padded with blanks. Never longer than `cells`.
 */
export function fitBoard(text: string, cells: number): string {
  const drum = toDrum(text);
  if (drum.length <= cells) return drum.padEnd(cells, " ");
  let out = "";
  for (const word of drum.split(" ")) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > cells) break;
    out = next;
  }
  return (out || drum.slice(0, cells)).padEnd(cells, " ");
}

/** How many drum steps a module turns to go from `from` to `to` (always forwards). */
export function flapSteps(from: string, to: string): number {
  const a = Math.max(0, DRUM.indexOf(from));
  const b = Math.max(0, DRUM.indexOf(to));
  return (b - a + DRUM.length) % DRUM.length;
}

export type Departure = {
  /** What the board says in the status column. */
  label: string;
  /** What it means in plain words, for the legend and screen readers. */
  meaning: string;
  tone: "on" | "late" | "off";
};

/** Project status as a departure status. */
export const departures: Record<ProjectStatus, Departure> = {
  active: { label: "Boarding", meaning: "active", tone: "on" },
  maintained: { label: "On time", meaning: "maintained", tone: "on" },
  wip: { label: "Delayed", meaning: "in progress", tone: "late" },
  archived: { label: "Cancelled", meaning: "archived", tone: "off" },
};

/** Module counts on the indicator's two rows. */
export const BOARD_CELLS = [12, 16] as const;

export type BoardText = {
  rows: [string, string];
  /** Bottom-row cells from this index on are printed signal yellow. */
  yellowFrom: number;
};

/**
 * A board label, `"TOP|BOTTOM|TAG"`, laid out on the indicator: the top row
 * is the destination, left-aligned; the bottom row carries the detail with
 * the optional tag right-aligned in yellow, like a status on a real board.
 */
export function composeBoard(
  label: string,
  cells: readonly [number, number] = BOARD_CELLS
): BoardText {
  const [top = "", bottom = "", tag = ""] = label.split("|");
  const [a, b] = cells;
  const flag = toDrum(tag).slice(0, Math.max(0, b - 2));
  const room = flag ? b - flag.length - 1 : b;
  const detail = fitBoard(bottom, room).slice(0, room);
  return {
    rows: [
      fitBoard(top, a),
      flag ? `${detail.padEnd(b - flag.length, " ")}${flag}` : detail.padEnd(b),
    ],
    yellowFrom: flag ? b - flag.length : b,
  };
}
