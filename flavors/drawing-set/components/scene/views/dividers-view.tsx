import { Group, Matrix4, Quaternion, Vector3 } from "three";

import { kick } from "@/lib/scene/clock";

import { Linework } from "../linework";
import * as M from "../models";
import { measured, offsetIn, type ViewFrame, type ViewModel } from "./kit";

/** The divider leg model's length (models.ts `dividerLeg`). */
const LEG = 0.7;
const DOWN = new Vector3(0, -1, 0);

/** Where each general note's first line sits, from the top of the view. */
function measureNotes(el: HTMLElement): number[] {
  const list = el.parentElement;
  if (!list) return [];
  return [...list.querySelectorAll("[data-note]")].map(
    (note) => offsetIn(el, note).y + 12
  );
}

/**
 * About B1: drafting dividers in the general notes' gutter, stepping off
 * the notes one at a time as they scroll past the reading line: the lower
 * point holds and the upper leg swings over it onto the next note.
 * Hovering a note walks them to it. Reduced motion: they stand on the
 * note in view (or the hovered one) without the swing.
 */
export function createDividers(): ViewModel {
  const group = new Group();
  const legs = new Linework(M.dividerLeg(), 2);
  group.add(legs.group);
  const m = new Matrix4();
  const q = new Quaternion();
  const s = new Vector3();
  const pivot = new Vector3();
  const foot = new Vector3();
  const hinge = new Vector3();
  const dir = new Vector3();
  const notes = measured(measureNotes);
  let step = 0;
  let hot = 0;
  let hovered: number | null = null;

  function frame(f: ViewFrame) {
    const ys = notes.read(f.el);
    const n = ys.length;
    if (n < 2) {
      legs.commit(0);
      return;
    }
    // Scroll: how far the reading line, 55% down the viewport, is through the notes.
    const line = innerHeight * 0.55 - f.el.getBoundingClientRect().top;
    let q0 = 0;
    for (let i = 0; i < n - 1; i++) {
      const a = ys[i] ?? 0;
      const b = ys[i + 1] ?? a;
      if (line >= b) q0 = i + 1;
      else if (line > a) q0 = i + (line - a) / Math.max(1, b - a);
    }
    let target = Math.min(n - 2, hovered ?? q0);
    if (!f.motion) target = Math.round(target);
    step = f.motion ? f.approach(step, target, 5) : target;
    hot = f.approach(hot, hovered === null ? 0 : 1, 10);

    // A note's point on the gutter line, in the view's frame (y up, centred).
    const gx = f.width / 2 - 6;
    const at = (i: number) => f.height / 2 - (ys[i] ?? 0);
    const k = Math.min(n - 2, Math.floor(step));
    const t = step - k;
    pivot.set(gx, at(k + 1), 0);
    const r1 = at(k) - at(k + 1);
    const r2 = k + 2 < n ? at(k + 1) - at(k + 2) : r1;
    const r = r1 + (r2 - r1) * t;
    const phi = Math.PI * t;
    // The swinging point comes round towards the viewer, not across the text.
    foot.set(gx, pivot.y + r * Math.cos(phi), r * Math.sin(phi));
    const reach = Math.min(
      f.width - 14,
      Math.max(10, pivot.distanceTo(foot) * 0.3)
    );
    hinge.addVectors(pivot, foot).multiplyScalar(0.5);
    hinge.x -= reach;
    [pivot, foot].forEach((point, i) => {
      dir.subVectors(point, hinge);
      const len = dir.length();
      q.setFromUnitVectors(DOWN, dir.normalize());
      m.compose(hinge, q, s.setScalar(len / LEG));
      legs.setMatrix(i, m);
      legs.setHot(i, hot);
    });
    legs.commit(1);
  }

  function bind(el: HTMLElement) {
    const list = el.parentElement;
    const unwatch = notes.watch(el);
    if (!list) return unwatch;
    const over = (e: Event) => {
      const note =
        e.target instanceof Element ? e.target.closest("[data-note]") : null;
      hovered = note
        ? [...list.querySelectorAll("[data-note]")].indexOf(note)
        : null;
      kick();
    };
    const out = () => {
      hovered = null;
      kick();
    };
    list.addEventListener("pointerover", over);
    list.addEventListener("pointerleave", out);
    return () => {
      unwatch();
      list.removeEventListener("pointerover", over);
      list.removeEventListener("pointerleave", out);
      hovered = null;
    };
  }

  return { group, aim: { az: 0.35, el: 0.08 }, frame, bind };
}
