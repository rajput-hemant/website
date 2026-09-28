import { padView, VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, CylinderGeometry, Group, Mesh } from "three";

import { motionOn } from "@/lib/scene/clock";

import {
  createDamp,
  inks,
  PressView,
  readData,
  scrolledIn,
  trackPointer,
  type ViewWorld,
} from "./kit";

const FIT = { width: 1.9, height: 1.5, aim: [0, 0.4, 0], fov: 24 } as const;
/** The rock as its group scrolls in: seconds, and swing in radians. */
const ROCK_S = 0.9;
const ROCK = 0.22;

/**
 * A glyph-size ink pad and its stamp beside a status group's heading. It
 * rocks once as the group scrolls into view and leans toward the pointer.
 * With motion off it is still.
 */
function createPad(el: HTMLElement | null): ViewWorld {
  const { struck } = readData<typeof VIEW.pad>(el, {
    status: "",
    struck: false,
  });
  const m = inks();
  const root = new Group();
  const tin = new Mesh(new BoxGeometry(1.5, 0.16, 1), m.shade);
  tin.position.y = 0.08;
  // The inked felt: blue for a live stamp, soft ink for out of print.
  const felt = new Mesh(
    new BoxGeometry(1.3, 0.04, 0.8),
    struck ? m.inkSoft : m.blue
  );
  felt.position.y = 0.17;
  const stamp = new Group();
  const handle = new Mesh(
    new CylinderGeometry(0.1, 0.14, 0.55, 16).translate(0, 0.42, 0),
    m.inkSoft
  );
  const base = new Mesh(
    new BoxGeometry(0.62, 0.14, 0.4).translate(0, 0.07, 0),
    m.shade
  );
  stamp.add(handle, base);
  stamp.position.set(0.25, 0.2, 0.05);
  root.add(tin, felt, stamp);

  const pointer = trackPointer(el, 3);
  const d = createDamp({ yaw: 0, pitch: 0 });
  let now = 0;
  let rockAt = -1;
  return {
    root,
    frame(delta) {
      now += delta;
      const live = motionOn();
      if (rockAt < 0 && scrolledIn(el) > 0.6) rockAt = now;
      const t = rockAt < 0 ? 0 : (now - rockAt) / ROCK_S;
      const rocking = live && rockAt >= 0 && t < 1;
      if (rocking) d.hold();
      stamp.rotation.z = rocking
        ? Math.sin(t * Math.PI * 3) * ROCK * (1 - t)
        : 0;
      const lean = live && pointer.p.inside;
      d.to("yaw", lean ? pointer.p.x * 0.3 : 0, 0.12, delta);
      d.to("pitch", lean ? -pointer.p.y * 0.12 : 0, 0.12, delta);
      root.rotation.set(d.v.pitch, d.v.yaw, 0);
      d.end();
    },
    dispose: pointer.dispose,
  };
}

/** The view for the `i`th group's pad. */
export function pads(i: number) {
  return function Pad() {
    return <PressView id={padView(i)} fit={FIT} create={createPad} />;
  };
}
