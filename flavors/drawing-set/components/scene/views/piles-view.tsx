import { entriesFor } from "@/flavors/drawing-set/lib/scene/page-state";
import { Group, Matrix4 } from "three";

import { kick } from "@/lib/scene/clock";

import { Linework } from "../linework";
import {
  compose,
  measured,
  offsetIn,
  type ViewFrame,
  type ViewModel,
} from "./kit";
import { flatSheet } from "./parts";

const PER_PILE = 12;
const MAX = 120;
const YEAR_LINK = 'a[href^="#log-"]';

type Row = { year: string; y: number };

const yearOf = (a: HTMLAnchorElement) => a.hash.replace("#log-", "");

/** Each year link in the index: its year and centre, from the top of the view. */
function measureRows(el: HTMLElement): Row[] {
  const nav = el.parentElement;
  if (!nav) return [];
  return [...nav.querySelectorAll<HTMLAnchorElement>(YEAR_LINK)].map((a) => {
    const box = offsetIn(el, a);
    return { year: yearOf(a), y: box.y + box.height / 2 };
  });
}

/**
 * Now N2: a pile of revision sheets beside each year in the log's index,
 * one sheet per entry (up to twelve). Pointing at or focusing a year lifts
 * its pile; while a category filter is on, the sheets that pass it are
 * redlined. Reduced motion: the piles stay put and only the redline moves.
 */
export function createPiles(): ViewModel {
  const group = new Group();
  const sheets = new Linework(flatSheet(), MAX);
  group.add(sheets.group);
  const m = new Matrix4();
  const lifts = new Map<string, number>();
  const hot = new Float32Array(MAX);
  const rows = measured(measureRows);
  let pointed: string | null = null;

  function frame(f: ViewFrame) {
    const log = entriesFor("now") ?? [];
    const filtered = log.some((e) => !e.match);
    const w = Math.min(f.width * 0.62, 44);
    const d = w * 0.62;
    let n = 0;
    for (const row of rows.read(f.el)) {
      const mine = log.filter((e) => e.kind === row.year);
      const lift = f.approach(
        lifts.get(row.year) ?? 0,
        f.motion && pointed === row.year ? 1 : 0,
        10
      );
      lifts.set(row.year, lift);
      const count = Math.min(PER_PILE, mine.length);
      const base = f.height / 2 - row.y - 5;
      for (let s = 0; s < count && n < MAX; s++, n++) {
        const on = filtered && mine[s]?.match === true;
        hot[n] = f.approach(hot[n] ?? 0, on ? 1 : 0, 10);
        compose(
          m,
          [((s * 7) % 5) - 2 + lift * 3, base + s * 1.4 + lift * 4, 0],
          [0, (((s * 13) % 7) - 3) * 0.02, 0],
          [w, 0.6, d]
        );
        sheets.setMatrix(n, m);
        sheets.setHot(n, hot[n] ?? 0);
      }
    }
    sheets.setCount(n);
    sheets.commit(n > 0 ? 1 : 0);
  }

  function bind(el: HTMLElement) {
    const nav = el.parentElement;
    const unwatch = rows.watch(el);
    if (!nav) return unwatch;
    const over = (e: Event) => {
      const a =
        e.target instanceof Element
          ? e.target.closest<HTMLAnchorElement>(YEAR_LINK)
          : null;
      pointed = a ? yearOf(a) : null;
      kick();
    };
    const out = () => {
      pointed = null;
      kick();
    };
    nav.addEventListener("pointerover", over);
    nav.addEventListener("focusin", over);
    nav.addEventListener("pointerleave", out);
    nav.addEventListener("focusout", out);
    return () => {
      unwatch();
      nav.removeEventListener("pointerover", over);
      nav.removeEventListener("focusin", over);
      nav.removeEventListener("pointerleave", out);
      nav.removeEventListener("focusout", out);
      pointed = null;
    };
  }

  return { group, aim: { az: 0.62, el: 0.55 }, frame, bind };
}
