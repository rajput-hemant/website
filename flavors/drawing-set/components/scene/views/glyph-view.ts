import { CylinderGeometry, Group, Matrix4 } from "three";

import { kick } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import { box, Linework, polyline, type Part } from "../linework";
import * as M from "../models";
import { compose, type ViewFrame, type ViewModel } from "./kit";

/**
 * Glyph views (audit appendix B slice 8): small tracked views, one per
 * glyph-sized object, that answer to the page element around them (the
 * `[data-glyph-host]` ancestor: a card, a row, a button). Hover and focus
 * lift them, a click or submit steps them, and the active role locks one.
 * Every glyph is damped through `approach`, so the clock sleeps once they
 * settle; reduced motion draws them still (the redline still follows). One
 * root group per glyph, so a later inspect control can take it over.
 */

/** What the host element is doing, read once per frame by the glyph's kind. */
type State = {
  /** Pointer over or focus within the host, damped 0..1 (0 with motion off). */
  hover: number;
  /** The same, undamped: for the redline, which motion off keeps. */
  lit: number;
  /** A press: 1 on a click (or the first frame in range), easing back to 0. */
  press: number;
  /** 1 while the scene's active item is the host's `data-scene-item`. */
  active: number;
  /** Clicks on the host, and submits of the form around it. */
  taps: number;
  submits: number;
  /** Times a field in the host was marked invalid. */
  fails: number;
};

type Kind = {
  group: Group;
  aim: { az: number; el: number };
  /** How much wider than tall the glyph's box is drawn for. */
  aspect?: number;
  frame: (f: ViewFrame, s: State) => void;
};

const m = new Matrix4();
const base = new Matrix4();

/** Scales a model of unit width to the glyph's box. */
function fit(f: ViewFrame, aspect = 1) {
  const u = Math.min(f.width, f.height * aspect) * 0.9;
  return compose(base, [0, 0, 0], [0, 0, 0], [u, u, u]);
}

/** H3: the sheet's title block lifts off it and the sheet tilts a few degrees. */
function sheet(): Kind {
  const group = new Group();
  const plate = new Linework([box(1, 0.03, 0.72)]);
  const block = new Linework([box(0.3, 0.03, 0.18)]);
  group.add(plate.group, block.group);
  const tilt = new Matrix4();
  return {
    group,
    aim: { az: -0.6, el: 0.75 },
    aspect: 1.3,
    frame(f, s) {
      compose(
        tilt,
        [0, 0, 0],
        [s.hover * 0.07, 0, -s.hover * 0.07],
        [1, 1, 1],
        fit(f, 1.3)
      );
      plate.setMatrix(0, tilt);
      plate.commit(1);
      compose(
        m,
        [0.32, 0.03 + s.hover * 0.12, 0.2],
        [0, 0, 0],
        [1, 1, 1],
        tilt
      );
      block.setMatrix(0, m);
      block.setHot(0, s.lit);
      block.commit(1);
    },
  };
}

/** P3, K2, B2: a rubber stamp that presses (onto an ink pad, if the host has one). */
function stamp(el: HTMLElement): Kind {
  const group = new Group();
  const pad = "pad" in el.dataset;
  const body = new Linework([
    box(0.5, 0.1, 0.34, 0, 0.05, 0),
    box(0.14, 0.3, 0.14, 0, 0.25, 0),
    box(0.3, 0.07, 0.2, 0, 0.435, 0),
  ]);
  const ink = new Linework([box(0.78, 0.05, 0.5, 0, -0.03, 0)]);
  group.add(body.group);
  if (pad) group.add(ink.group);
  return {
    group,
    aim: { az: -0.5, el: 0.5 },
    frame(f, s) {
      const y = 0.02 + s.hover * 0.05 - s.press * 0.07;
      compose(m, [0, y, 0], [0, 0, s.hover * 0.035], [1, 1, 1], fit(f));
      body.setMatrix(0, m);
      body.setHot(0, s.press > 0.05 ? 1 : s.lit);
      body.commit(1);
      if (pad) {
        ink.setMatrix(0, fit(f));
        ink.commit(1);
      }
    },
  };
}

/** W2: a pin joint between two links. The links straighten (lock) as the role goes active. */
function pin(): Kind {
  const group = new Group();
  const links = new Linework([box(0.5, 0.07, 0.035, 0.25, 0, 0)], 2);
  const head = new Linework([
    { geo: new CylinderGeometry(0.07, 0.07, 0.06, 16), threshold: 30 },
    polyline([
      [-0.05, 0.031, 0],
      [0.05, 0.031, 0],
    ]),
    polyline([
      [0, 0.031, -0.05],
      [0, 0.031, 0.05],
    ]),
  ]);
  group.add(links.group, head.group);
  return {
    group,
    aim: { az: 0, el: 0.95 },
    aspect: 1,
    frame(f, s) {
      const b = fit(f);
      const open = (1 - s.active) * 0.9;
      compose(m, [0, 0, 0], [0, 0, 0], [1, 1, 1], b);
      links.setMatrix(0, m);
      compose(m, [0, 0, 0], [0, Math.PI - open, 0], [1, 1, 1], b);
      links.setMatrix(1, m);
      links.setHot(0, s.active);
      links.setHot(1, s.active);
      links.commit(1);
      compose(m, [0, 0.04, 0], [0, s.hover * (Math.PI / 2), 0], [1, 1, 1], b);
      head.setMatrix(0, m);
      head.setHot(0, s.lit);
      head.commit(1);
    },
  };
}

const arc = (cx: number, cy: number, r: number, from: number, to: number) =>
  Array.from({ length: 9 }, (_, i) => {
    const a = from + ((to - from) * i) / 8;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0];
  });

/** R2: a paper clip whose inner loop opens a few degrees when its thread is pointed at. */
function clip(): Kind {
  const group = new Group();
  const outer: Part = polyline([
    [-0.18, -0.4, 0],
    [-0.18, 0.28, 0],
    ...arc(0, 0.28, 0.18, Math.PI, 0),
    [0.18, -0.25, 0],
  ]);
  // The inner loop, drawn about its pivot (the outer's right end) at the origin.
  const inner: Part = polyline([
    ...arc(-0.09, 0, 0.09, 0, -Math.PI),
    [-0.18, 0.4, 0],
    ...arc(-0.27, 0.4, 0.09, 0, Math.PI),
  ]);
  const a = new Linework([outer]);
  const b = new Linework([inner]);
  group.add(a.group, b.group);
  return {
    group,
    aim: { az: 0.5, el: 0.25 },
    frame(f, s) {
      const k = fit(f);
      a.setMatrix(0, k);
      a.setHot(0, s.lit);
      a.commit(1);
      compose(m, [0.18, -0.25, 0], [0, 0, s.hover * 0.26], [1, 1, 1], k);
      b.setMatrix(0, m);
      b.setHot(0, s.lit);
      b.commit(1);
    },
  };
}

/** L2: the study's solid, turning at 0.6 rad/s only while its card is pointed at. */
function solid(el: HTMLElement): Kind {
  const group = new Group();
  const all = M.studies();
  const i = (Number(el.dataset.study) || 0) % all.length;
  const body = new Linework(all[i] ?? []);
  group.add(body.group);
  let angle = 0.4;
  let rate = 0;
  return {
    group,
    aim: { az: 0.35, el: 0.45 },
    frame(f, s) {
      rate = f.approach(rate, f.motion && s.lit ? 0.6 : 0, 6);
      angle += rate * f.dt;
      if (rate > 1e-3) kick();
      compose(m, [0, -0.2, 0], [0, angle, 0], [1, 1, 1], fit(f));
      body.setMatrix(0, m);
      body.setHot(0, s.lit);
      body.commit(1);
    },
  };
}

/** U2: a plotter's carriage on its rail; a click steps it along, as the print dialog opens. */
function plotter(): Kind {
  const group = new Group();
  const rail = new Linework([box(1, 0.05, 0.1)]);
  const pen = new Linework(M.carriage());
  group.add(rail.group, pen.group);
  let at = 0;
  return {
    group,
    aim: { az: 0.3, el: 0.8 },
    aspect: 2,
    frame(f, s) {
      const k = fit(f, 2);
      rail.setMatrix(0, k);
      rail.commit(1);
      const target = -0.36 + (s.taps % 4) * 0.24 + s.hover * 0.05;
      at = f.motion ? f.approach(at, target, 14) : target;
      compose(m, [at, 0.08, 0], [0, 0, 0], [1, 1, 1], k);
      pen.setMatrix(0, m);
      pen.setHot(0, s.lit);
      pen.commit(1);
    },
  };
}

/** O2: a combination dial that turns a notch per submit and shakes back when it fails. */
function dial(): Kind {
  const group = new Group();
  const ring = new Linework([
    { geo: new CylinderGeometry(0.4, 0.4, 0.1, 32), threshold: 30 },
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r = i % 3 === 0 ? 0.26 : 0.31;
      return polyline([
        [Math.cos(a) * r, 0.051, Math.sin(a) * r],
        [Math.cos(a) * 0.37, 0.051, Math.sin(a) * 0.37],
      ]);
    }),
  ]);
  const mark = new Linework([
    polyline([
      [0, 0.06, -0.46],
      [0, 0.06, -0.38],
    ]),
  ]);
  group.add(ring.group, mark.group);
  let turn = 0;
  let shake = 0;
  let seen = 0;
  return {
    group,
    aim: { az: 0, el: 1 },
    frame(f, s) {
      const k = fit(f);
      turn = f.motion ? f.approach(turn, s.submits, 8) : s.submits;
      if (s.fails > seen) {
        seen = s.fails;
        if (f.motion) shake = 1;
      }
      shake = f.approach(shake, 0, 7);
      compose(
        m,
        [Math.sin(shake * 18) * shake * 0.12, 0, 0],
        [0, -turn * (Math.PI / 6), 0],
        [1, 1, 1],
        k
      );
      ring.setMatrix(0, m);
      ring.setHot(0, s.lit);
      ring.commit(1);
      mark.setMatrix(0, k);
      mark.setHot(0, 1);
      mark.commit(1);
    },
  };
}

const KINDS: Record<string, (el: HTMLElement) => Kind> = {
  sheet,
  stamp,
  pin,
  clip,
  solid,
  plotter,
  dial,
};

/**
 * One glyph view: the kind it draws is its placeholder's `data-glyph`, and
 * `data-press` says when a stamp presses ("hover": while pointed at,
 * "enter": once, as it scrolls in; otherwise on a click).
 */
export function createGlyph(): ViewModel {
  const group = new Group();
  const aim = { az: 0, el: 0.5 };
  const s: State = {
    hover: 0,
    lit: 0,
    press: 0,
    active: 0,
    taps: 0,
    submits: 0,
    fails: 0,
  };
  let kind: Kind | null = null;
  let host: HTMLElement | null = null;
  let hovering = false;
  let focused = false;
  let pressed = false;
  let entered = false;
  let mode = "";

  function frame(f: ViewFrame) {
    if (!kind) return;
    if (mode === "enter" && !entered) {
      entered = true;
      pressed = true;
    }
    const lit = hovering || focused ? 1 : 0;
    s.lit = lit;
    s.hover = f.motion ? f.approach(s.hover, lit, 14) : 0;
    if (mode === "hover") {
      s.press = f.motion ? f.approach(s.press, lit, 30) : 0;
    } else {
      if (pressed) s.press = f.motion ? 1 : 0;
      pressed = false;
      s.press = f.approach(s.press, 0, 9);
    }
    const id = host?.dataset.sceneItem;
    const on = id && sceneStore.getState().active === id ? 1 : 0;
    s.active = f.motion ? f.approach(s.active, on, 6) : on;
    kind.frame(f, s);
  }

  function bind(el: HTMLElement) {
    const make = KINDS[el.dataset.glyph ?? ""];
    if (!make) return () => undefined;
    kind = make(el);
    group.add(kind.group);
    Object.assign(aim, kind.aim);
    mode = el.dataset.press ?? "";
    host = el.closest<HTMLElement>("[data-glyph-host]") ?? el.parentElement;
    if (!host) return () => undefined;
    const target = host;
    const wake = (fn: () => void) => () => {
      fn();
      kick();
    };
    const on = {
      pointerenter: wake(() => (hovering = true)),
      pointerleave: wake(() => (hovering = false)),
      focusin: wake(
        () => (focused = target.matches(":focus-visible, :has(:focus-visible)"))
      ),
      focusout: wake(() => (focused = false)),
      click: wake(() => {
        s.taps++;
        pressed = true;
      }),
      submit: wake(() => s.submits++),
    };
    for (const [type, fn] of Object.entries(on)) {
      target.addEventListener(type, fn);
    }
    const invalid = new MutationObserver((records) => {
      if (
        records.some(
          (r) =>
            r.target instanceof Element && r.target.hasAttribute("aria-invalid")
        )
      ) {
        s.fails++;
        kick();
      }
    });
    invalid.observe(target, {
      attributes: true,
      attributeFilter: ["aria-invalid"],
      subtree: true,
    });
    const offActive = sceneStore.subscribe((now, was) => {
      if (now.active !== was.active) kick();
    });
    kick();
    return () => {
      for (const [type, fn] of Object.entries(on)) {
        target.removeEventListener(type, fn);
      }
      invalid.disconnect();
      offActive();
      if (kind) group.remove(kind.group);
      kind = null;
      hovering = false;
      focused = false;
    };
  }

  return { group, aim, frame, bind };
}
