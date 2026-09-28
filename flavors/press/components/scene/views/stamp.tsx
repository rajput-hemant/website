import { VIEW } from "@/flavors/press/lib/scene/views";
import { pressVoices } from "@/flavors/press/lib/sound/voices";
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { isSoundOn, playVoice } from "@/lib/sound";

import { createDamp, inks, PressView, type ViewWorld } from "./kit";

const FIT = {
  width: 1.6,
  height: 2.2,
  aim: [0, 0.7, 0],
  from: [0.5, 0.35, 1],
} as const;
/** Once a session, the stamp comes down by itself, like the proof stamp. */
let stampedThisSession = false;
/** How long the foot stays down, seconds, and the wait before it drops. */
const DOWN = 0.09;
const LEAD = 0.18;

/**
 * A rubber stamp beside the proof stamp: it presses down on its first view
 * in a session and again, with the stamp voice, when clicked. The foot
 * squashes for 90ms as it lands. With motion off it rests, lifted.
 */
function createStamp(el: HTMLElement | null): ViewWorld {
  const m = inks();
  const root = new Group();
  const body = new Group();
  const handle = new Mesh(
    new CylinderGeometry(0.16, 0.22, 0.7, 20).translate(0, 0.55, 0),
    m.shade
  );
  const knob = new Mesh(
    new SphereGeometry(0.24, 18, 12).translate(0, 1.0, 0),
    m.inkSoft
  );
  const foot = new Mesh(new BoxGeometry(0.9, 0.2, 0.6), m.blue);
  foot.position.y = 0.1;
  body.add(handle, knob, foot);
  root.add(body);

  const d = createDamp({ y: 0.5, squash: 0 });
  let now = 0;
  let downAt = -1;
  const press = () => {
    if (!motionOn()) return;
    downAt = now + LEAD;
    kick();
  };
  if (!stampedThisSession) {
    stampedThisSession = true;
    press();
  }
  const click = () => {
    press();
    if (isSoundOn()) playVoice(pressVoices.stamp);
  };
  el?.addEventListener("click", click);

  return {
    root,
    frame(delta) {
      now += delta;
      const since = now - downAt;
      const down = downAt >= 0 && since >= 0 && since < DOWN;
      if (downAt >= 0 && since < DOWN + 0.05) d.hold();
      d.to("y", down ? 0 : 0.5, down ? 0.6 : 0.14, delta);
      d.to("squash", down ? 1 : 0, 0.5, delta);
      body.position.y = d.v.y;
      foot.scale.set(1 + d.v.squash * 0.06, 1 - d.v.squash * 0.35, 1);
      d.end();
    },
    dispose: () => el?.removeEventListener("click", click),
  };
}

export const Stamp = () => (
  <PressView id={VIEW.stamp} fit={FIT} create={createStamp} />
);
