import {
  DRUM,
  glyphOf,
  riffleFrom,
  stepToward,
} from "@/flavors/timetable/lib/board";
import { flutter } from "@/flavors/timetable/lib/sound/flutter";

/** The 3D module's pace (`FLIP` in world.tsx) and its stagger per column. */
const STEP_MS = 55;
const COLUMN_MS = 22;

type Cell = { text: Text; cur: number; target: number; at: number };
type Run = { cells: Cell[]; gain: number | null; seen: boolean };

const runs = new Map<HTMLElement, Run>();
let raf = 0;

const motionOn = () => document.documentElement.dataset.motion === "on";

/**
 * The cell's own text node, reused: writing `data` is a characterData
 * change, which the page's childList observers never hear, so a turning
 * board doesn't make them rescan every step.
 */
function textOf(cell: HTMLElement): Text {
  const node = cell.firstChild;
  if (node instanceof Text && node === cell.lastChild) return node;
  const text = document.createTextNode(cell.textContent ?? "");
  cell.replaceChildren(text);
  return text;
}

function frame(now: number) {
  raf = 0;
  for (const [board, run] of runs) {
    let steps = 0;
    let busy = false;
    for (const cell of run.cells) {
      if (cell.cur !== cell.target && now >= cell.at) {
        cell.cur = stepToward(cell.cur, cell.target);
        cell.text.data = DRUM[cell.cur] ?? " ";
        cell.at += STEP_MS;
        steps++;
      }
      if (cell.cur !== cell.target) busy = true;
    }
    if (steps && run.gain !== null && run.seen) flutter.steps(steps, run.gain);
    if (!busy) runs.delete(board);
  }
  if (runs.size) raf = requestAnimationFrame(frame);
}

function start(board: HTMLElement, run: Run) {
  runs.set(board, run);
  raf ||= requestAnimationFrame(frame);
}

export type RiffleOptions = {
  /** Most flaps any one module turns; each starts that far up its drum. */
  max?: number;
  /** Flutter at this gain while the board is on screen; omit for silence. */
  gain?: number;
};

/**
 * Turns every cell of a `[data-flap]` board up its drum to the character it
 * already shows, in drum order and staggered by column, like the modules on
 * the 3D indicator. One animation frame loop runs every board and stops
 * once the last cell lands.
 */
export function riffle(board: HTMLElement, { max = 8, gain }: RiffleOptions) {
  if (!motionOn()) return;
  const t0 = performance.now();
  const cells: Cell[] = [];
  [...board.children].forEach((el, i) => {
    if (!(el instanceof HTMLElement)) return;
    const target = glyphOf(el.dataset.c ?? el.textContent ?? " ");
    const cur = riffleFrom(target, max);
    if (cur === target) return;
    const text = textOf(el);
    text.data = DRUM[cur] ?? " ";
    cells.push({ text, cur, target, at: t0 + i * COLUMN_MS });
  });
  if (!cells.length) return;
  const run: Run = { cells, gain: gain ?? null, seen: true };
  if (gain !== undefined) watch(board, run, (max + cells.length) * STEP_MS);
  start(board, run);
}

/** Keeps `run.seen` current while the board may still be turning. */
function watch(board: HTMLElement, run: Run, ms: number) {
  const io = new IntersectionObserver(([entry]) => {
    run.seen = entry?.isIntersecting ?? false;
  });
  io.observe(board);
  setTimeout(() => io.disconnect(), ms);
}

/**
 * Sets a `[data-flap]` board to `value` (one character per cell, the rest
 * blank) by turning each changed cell forwards through its drum. Motion off,
 * the new text is placed at once.
 */
export function flapTo(board: HTMLElement, value: string, gain?: number) {
  const els = [...board.children].filter((el) => el instanceof HTMLElement);
  const t0 = performance.now();
  const moving = runs.get(board);
  const cells: Cell[] = [];
  els.forEach((el, i) => {
    const char = value[i] ?? " ";
    const target = glyphOf(char);
    el.dataset.c = DRUM[target] ?? " ";
    const text = textOf(el);
    const turning = moving?.cells.find((cell) => cell.text === text);
    const cur = turning?.cur ?? glyphOf(text.data);
    if (!motionOn()) {
      text.data = DRUM[target] ?? " ";
      return;
    }
    if (cur !== target) {
      cells.push({ text, cur, target, at: turning?.at ?? t0 + i * COLUMN_MS });
    }
  });
  if (!cells.length) {
    runs.delete(board);
    return;
  }
  start(board, { cells, gain: gain ?? null, seen: true });
}
