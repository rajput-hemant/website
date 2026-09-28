/**
 * Split-flap board text. A real module can only show what is printed on its
 * drum, so every string is fitted to the drum and to a fixed cell count
 * before it reaches the DOM board or the 3D indicator.
 */
import type { ProjectStatus } from "@/lib/data/types";
import { formatMonthYear } from "@/lib/format";

/** The drum of one module, in the order the flaps turn: blank first. */
export const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-/&'";

/** Board copy shown on the indicator after a visitor sends an Ask notice. */
export const ASK_SENT_BOARD = "NOTICE RCVD|AWAITING REVIEW|HELD";

/** The /owner board once the owner is signed in; the padlock opens on it. */
export const OWNER_ON_BOARD = "STAFF|SIGNED IN|ON DUTY";

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

/** "Sep 24": a month in as few flap cells as it can take. */
export const boardMonth = (date: string) =>
  formatMonthYear(date).replace(/(\w+) \d\d(\d\d)$/, "$1 $2");

/** The same span in 16 flap cells: "SEP 24 TO JAN 26". */
export const boardDates = (start: string, end?: string) =>
  `${boardMonth(start)} to ${end ? boardMonth(end) : "now"}`;

/**
 * What the indicator reads for a role, wherever the role is pointed at: the
 * map line, its key entry or its line guide.
 */
export const roleBoard = (role: {
  company: string;
  startDate: string;
  endDate?: string | undefined;
}) => `${role.company}|${boardDates(role.startDate, role.endDate)}`;

/** Glyphs per ink: the drum's positions, printed white, then yellow. */
const N = DRUM.length;

/** Glyph index for a character, yellow or not. Unknown characters are blank. */
export const glyphOf = (char: string, yellow = false) =>
  Math.max(0, DRUM.indexOf(char)) + (yellow ? N : 0);

/** The drum position a glyph is printed at, ignoring its ink. */
export const drumOf = (glyph: number) => glyph % N;

/**
 * One flap on from `cur` towards `target`, printed in the target's ink. The
 * 3D modules and the DOM boards both turn with this, so they flip alike.
 */
export const stepToward = (cur: number, target: number) =>
  drumOf(cur) === drumOf(target)
    ? target
    : (target >= N ? N : 0) + ((drumOf(cur) + 1) % N);

/**
 * Where a module starts so it lands on `target` after at most `max` flaps,
 * turning up from blank: A takes one flap, the rest their last `max`.
 */
export const riffleFrom = (target: number, max: number) =>
  drumOf(target) -
  Math.min(drumOf(target), Math.max(0, max)) +
  (target >= N ? N : 0);

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
  /** Cells of `yellowRow` from this index on are printed signal yellow. */
  yellowFrom: number;
  /** The row that carries the tag: the bottom, or the top of a mini board. */
  yellowRow: 0 | 1;
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
    yellowRow: 1,
  };
}

/**
 * A mini board's label, `"TEXT|TAG"`, on its one row of top modules: the
 * text left-aligned and the tag right-aligned in yellow. The bottom row is
 * blank (and hidden on the mini housing).
 */
export function composeMini(
  label: string,
  cells: readonly [number, number] = BOARD_CELLS
): BoardText {
  const [text = "", tag = ""] = label.split("|");
  const [a, b] = cells;
  const { rows, yellowFrom } = composeBoard(`|${text}|${tag}`, [a, a]);
  return { rows: [rows[1], " ".repeat(b)], yellowFrom, yellowRow: 0 };
}
