import { OWNER_ON_BOARD } from "@/flavors/timetable/lib/board";
import {
  EXTRAS,
  HOUSING,
  type Extra,
} from "@/flavors/timetable/lib/scene/poses";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  TorusGeometry,
  type Material,
} from "three";

import { kick, tween } from "@/lib/scene/clock";

import { createClockFace } from "./clock-face";

const { H } = HOUSING;
const TAU = Math.PI * 2;

export type ExtraState = {
  hovered: string | null;
  board: string | null;
  progress: number;
};

type Spring = { x: number; v: number };
const spring = (s: Spring, target: number) => {
  s.v = (s.v + (target - s.x) * 0.08) * 0.8;
  s.x += s.v;
  return Math.abs(s.v) > 1e-4 || Math.abs(target - s.x) > 1e-3;
};

const standard = (color: string, extra = {}) =>
  new MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.2,
    ...extra,
  });

/** A rod from `top` up to the ceiling the indicator hangs from. */
function rod(material: Material, x: number, top: number, ceiling: number) {
  const length = ceiling - top;
  const mesh = new Mesh(new CylinderGeometry(0.02, 0.02, length, 8), material);
  mesh.position.set(x, top + length / 2, 0);
  return mesh;
}

/** The Hilfiker-style station clock on /now: hands jump once a minute. */
function createClock(rodMaterial: Material, ceiling: number) {
  const { x, r } = EXTRAS.clock;
  const face = createClockFace(r);
  const group = new Group();
  group.position.set(x, H / 2 - r - 0.08, 0);
  group.add(
    face.group,
    rod(rodMaterial, 0, r + 0.05, ceiling - group.position.y)
  );

  let timer = 0;
  const set = () => {
    const now = new Date();
    face.set(now);
    kick();
    timer = window.setTimeout(
      set,
      60_000 - (now.getSeconds() * 1000 + now.getMilliseconds())
    );
  };
  return {
    group,
    show(on: boolean) {
      clearTimeout(timer);
      if (on) set();
    },
  };
}

/** The amber test beacon on the housing over /lab: it turns while a card is pointed at. */
function createBeacon() {
  const { x, h } = EXTRAS.beacon;
  const group = new Group();
  group.position.set(x, H / 2, 0);
  const base = new Mesh(
    new CylinderGeometry(0.13, 0.15, 0.06, 20),
    standard("#1b2025", { metalness: 0.5 })
  );
  base.position.y = 0.03;
  const lensMaterial = standard("#ffb000", {
    transparent: true,
    opacity: 0.82,
    emissive: new Color("#ff9d00"),
    emissiveIntensity: 0.08,
  });
  const lens = new Mesh(
    new CylinderGeometry(0.1, 0.11, h - 0.06, 20),
    lensMaterial
  );
  lens.position.y = 0.06 + (h - 0.06) / 2;
  const mirrorMaterial = standard("#fff4d0", {
    emissive: new Color("#ffc20e"),
    emissiveIntensity: 0.1,
    metalness: 0.8,
  });
  const mirror = new Mesh(
    new BoxGeometry(0.15, h * 0.55, 0.012),
    mirrorMaterial
  );
  mirror.position.y = lens.position.y;
  group.add(base, lens, mirror);

  let lit = false;
  return {
    group,
    update(state: ExtraState) {
      const next = !!state.hovered?.startsWith("study:");
      if (next === lit) return;
      lit = next;
      tween(lensMaterial, {
        emissiveIntensity: lit ? 1.4 : 0.08,
        duration: 0.2,
      });
      tween(mirrorMaterial, {
        emissiveIntensity: lit ? 2 : 0.1,
        duration: 0.2,
      });
    },
    /** Turns only while lit and motion is on; returns whether it moved. */
    frame(delta: number, live: boolean) {
      if (!lit || !live) return false;
      mirror.rotation.y = (mirror.rotation.y + delta * 5) % TAU;
      return true;
    },
  };
}

/** The pocket timetable on /resume: six panels that unfold as the page scrolls. */
function createLeaflet(rodMaterial: Material, ceiling: number) {
  const { x, n, panel } = EXTRAS.leaflet;
  const [pw, ph] = panel;
  const group = new Group();
  group.position.set(x, H / 2 - ph / 2 - 0.2, 0);
  const geometry = new PlaneGeometry(pw, ph);
  // Unlit paper; alternate panels a shade apart so the folds read.
  const panels = new InstancedMesh(
    geometry,
    new MeshBasicMaterial({ color: "#ffffff", side: DoubleSide }),
    n
  );
  const paper = new Color("#f4f6f7");
  const shade = new Color("#d9dee2");
  const cover = new Color("#ffc20e");
  for (let i = 0; i < n; i++) {
    const end = i === 0 || i === n - 1;
    panels.setColorAt(i, end ? cover : i % 2 ? shade : paper);
  }
  group.add(panels, rod(rodMaterial, 0, ph / 2, ceiling - group.position.y));

  const open: Spring = { x: 0, v: 0 };
  let target = 0;
  const m = new Matrix4();
  const place = () => {
    // Fanned nearly shut at 0, a flat strip at 1.
    const angle = (1 - open.x) * (Math.PI / 2 - 0.12);
    const step = pw * Math.cos(angle);
    const start = -(n * step) / 2;
    for (let i = 0; i < n; i++) {
      const turn = i % 2 ? -angle : angle;
      const z = (i % 2 ? 0.5 : -0.5) * pw * Math.sin(angle);
      m.makeRotationY(turn).setPosition(start + (i + 0.5) * step, 0, z);
      panels.setMatrixAt(i, m);
    }
    panels.instanceMatrix.needsUpdate = true;
    // Folded, the cover faces the concourse; open, the strip lies flat.
    group.rotation.y = -angle;
  };
  place();
  return {
    group,
    update(state: ExtraState) {
      target = Math.min(1, Math.max(0, state.progress * 3));
    },
    frame(live: boolean) {
      if (!live) {
        if (open.x === target) return false;
        open.x = target;
        open.v = 0;
        place();
        return false;
      }
      const moving = spring(open, target);
      place();
      return moving;
    },
  };
}

/** The desk padlock on /owner: the shackle opens once the owner signs in. */
function createPadlock() {
  const { x, w, h } = EXTRAS.padlock;
  const group = new Group();
  group.position.set(x, 0.05, 0);
  const brass = standard("#c9a227", { metalness: 0.75, roughness: 0.35 });
  // A staple on the housing's side that the shackle passes round.
  const hasp = new Mesh(
    new BoxGeometry(0.72, 0.05, 0.08),
    standard("#1b2025", { metalness: 0.5 })
  );
  hasp.position.set(-0.25, h / 2 + 0.08, 0);
  const body = new Mesh(new BoxGeometry(w, h, 0.18), brass);
  const keyhole = new Mesh(
    new CylinderGeometry(0.035, 0.035, 0.02, 12),
    standard("#14191e")
  );
  keyhole.rotation.x = Math.PI / 2;
  keyhole.position.set(0, -0.02, 0.095);
  const shackle = new Group();
  const bow = new Mesh(
    new TorusGeometry(0.15, 0.035, 10, 24, Math.PI),
    standard("#9aa4ad", { metalness: 0.9, roughness: 0.3 })
  );
  bow.position.x = 0.15;
  shackle.add(bow);
  // Hinged on its left leg, like a real shackle.
  shackle.position.set(-0.15, h / 2, 0);
  group.add(hasp, body, keyhole, shackle);

  let unlocked = false;
  return {
    group,
    update(state: ExtraState, live: boolean) {
      const next = state.board === OWNER_ON_BOARD;
      if (next === unlocked) return;
      unlocked = next;
      const to = { y: h / 2 + (unlocked ? 0.13 : 0) };
      const turn = { y: unlocked ? -0.9 : 0 };
      if (!live) {
        shackle.position.y = to.y;
        shackle.rotation.y = turn.y;
        kick();
        return;
      }
      tween(shackle.position, { ...to, duration: 0.3, ease: "back.out(2)" });
      tween(shackle.rotation, { ...turn, duration: 0.3, ease: "power2.out" });
    },
  };
}

/**
 * The objects that hang beside the indicator on one route each. Only the
 * route's own object is visible, and each one renders only when something
 * changes: a minute, a hover, scroll progress or a sign-in.
 */
export function createExtras(rodMaterial: Material, ceiling: number) {
  const clock = createClock(rodMaterial, ceiling);
  const beacon = createBeacon();
  const leaflet = createLeaflet(rodMaterial, ceiling);
  const padlock = createPadlock();
  const groups: Record<Extra, Group> = {
    clock: clock.group,
    beacon: beacon.group,
    leaflet: leaflet.group,
    padlock: padlock.group,
  };
  const root = new Group();
  root.add(...Object.values(groups));
  // Unset until the first show, so show(null) hides every object.
  let current: Extra | null | undefined;
  const show = (extra: Extra | null) => {
    if (extra === current) return;
    current = extra;
    for (const [key, group] of Object.entries(groups)) {
      group.visible = key === extra;
    }
    clock.show(extra === "clock");
  };
  show(null);

  return {
    root,
    show,
    update(state: ExtraState, live: boolean) {
      if (current === "beacon") beacon.update(state);
      if (current === "leaflet") leaflet.update(state);
      if (current === "padlock") padlock.update(state, live);
    },
    /** Steps the visible object; true while it is still moving. */
    frame(delta: number, live: boolean) {
      if (current === "beacon") return beacon.frame(delta, live);
      if (current === "leaflet") return leaflet.frame(live);
      return false;
    },
    dispose() {
      clock.show(false);
    },
  };
}
