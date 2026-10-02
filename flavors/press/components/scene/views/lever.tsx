import { VIEW } from "@/flavors/press/lib/scene/views";
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";

import { kick } from "@/lib/scene/clock";

import {
  createDamp,
  inks,
  onTheme,
  PressView,
  watchAttribute,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 1.4,
  height: 1.2,
  aim: [0, 0.45, 0],
  from: [0.3, 0.3, 1],
  fov: 22,
} as const;
/** The lever's throw, radians from upright. */
const OFF = -0.6;
const ON = 0.6;

/** The experiment's stage says it is running with `data-stage-live`. */
export const STAGE_LIVE = "[data-stage]";

/**
 * A start lever by the test's stage: it throws when the experiment starts
 * and returns when it stops. With motion off it simply stands at its
 * position. (While the experiment runs the session pauses for its canvas,
 * so the lever's poster shows the thrown lever then.)
 */
function createLever(): ViewWorld {
  const m = inks();
  const root = new Group();
  const base = new Mesh(
    new BoxGeometry(0.9, 0.16, 0.5).translate(0, 0.08, 0),
    m.shade
  );
  const arm = new Group();
  arm.position.y = 0.16;
  const rod = new Mesh(
    new CylinderGeometry(0.035, 0.035, 0.7, 10).translate(0, 0.35, 0),
    m.inkSoft
  );
  const knob = new Mesh(
    new SphereGeometry(0.09, 14, 10).translate(0, 0.72, 0),
    m.pink
  );
  arm.add(rod, knob);
  root.add(base, arm);
  let running = false;
  const offStage = watchAttribute(STAGE_LIVE, "data-stage-live", (v) => {
    running = v !== null;
  });
  const d = createDamp({ throw: OFF });
  return {
    root,
    frame(delta) {
      d.to("throw", running ? ON : OFF, 0.2, delta);
      arm.rotation.z = -d.v.throw;
      d.end();
    },
    dispose: offStage,
  };
}

/**
 * A glyph-size roller inked in the experiment's accent (the pink plate,
 * which the theme flips): it rolls one turn each time the accent changes.
 * With motion off it stays put and only changes colour.
 */
function createAccentRoller(): ViewWorld {
  const m = inks();
  const root = new Group();
  const roll = new Mesh(
    new CylinderGeometry(0.28, 0.28, 0.9, 28).rotateX(Math.PI / 2),
    m.pink
  );
  roll.position.y = 0.28;
  const axle = new Mesh(
    new CylinderGeometry(0.05, 0.05, 1.1, 10).rotateX(Math.PI / 2),
    m.ink
  );
  axle.position.y = 0.28;
  root.add(roll, axle);
  const d = createDamp({ turn: 0 });
  let target = 0;
  const offTheme = onTheme(() => {
    target += Math.PI * 2;
    kick();
  });
  return {
    root,
    frame(delta) {
      d.to("turn", target, 0.08, delta);
      roll.rotation.z = -d.v.turn;
      root.position.x = -((d.v.turn - target) / (Math.PI * 2)) * 0.2;
      d.end();
    },
    dispose: offTheme,
  };
}

export const Lever = () => (
  <PressView id={VIEW.lever} fit={FIT} create={createLever} />
);

export const AccentRoller = () => (
  <PressView id={VIEW.accentRoller} fit={FIT} create={createAccentRoller} />
);
