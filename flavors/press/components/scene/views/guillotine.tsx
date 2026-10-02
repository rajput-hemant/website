import { ITEM, VIEW, VIEW_EVENT } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, Group, Mesh } from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import { createDamp, inks, PressView, type ViewWorld } from "./kit";

const FIT = {
  width: 1.7,
  height: 1.6,
  aim: [0, 0.6, 0],
  from: [0.45, 0.35, 1],
  fov: 24,
} as const;
/** The blade's travel: up, hovered (30% down) and dropped onto the stack. */
const UP = 1.05;
const LOW = UP - 0.3 * (UP - 0.36);
const DOWN = 0.36;

/**
 * A guillotine over a trimmed stack, by the print button. Pointing at the
 * button lowers the blade a third of the way; pressing it drops the blade
 * (80ms) before the print dialog opens. With motion off it stays up.
 */
function createGuillotine(): ViewWorld {
  const m = inks();
  const root = new Group();
  const stack = new Mesh(
    new BoxGeometry(1, 0.3, 0.7).translate(0, 0.15, 0),
    m.sheet
  );
  const bed = new Mesh(new BoxGeometry(1.4, 0.06, 0.9), m.shade);
  bed.position.y = -0.03;
  const blade = new Mesh(new BoxGeometry(1.25, 0.12, 0.05), m.ink);
  blade.position.z = 0.36;
  root.add(bed, stack, blade);
  const d = createDamp({ y: UP });
  let dropUntil = -1;
  let now = 0;
  const drop = () => {
    if (!motionOn()) return;
    dropUntil = now + 0.25;
    kick();
  };
  addEventListener(VIEW_EVENT.print, drop);

  return {
    root,
    frame(delta) {
      now += delta;
      const live = motionOn();
      const dropping = now < dropUntil;
      if (dropping) d.hold();
      const hovered = sceneStore.getState().hovered === ITEM.print;
      const target = !live ? UP : dropping ? DOWN : hovered ? LOW : UP;
      d.to("y", target, dropping ? 0.8 : 0.16, delta);
      blade.position.y = d.v.y;
      d.end();
    },
    dispose: () => removeEventListener(VIEW_EVENT.print, drop),
  };
}

export const Guillotine = () => (
  <PressView id={VIEW.guillotine} fit={FIT} create={createGuillotine} />
);
