import { VIEW } from "@/flavors/press/lib/scene/views";
import { pressVoices } from "@/flavors/press/lib/sound/voices";
import {
  CylinderGeometry,
  Group,
  InstancedMesh,
  Object3D,
  SphereGeometry,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { isSoundOn, playVoice } from "@/lib/sound";

import {
  createDamp,
  inks,
  PressView,
  trackPointer,
  visibleSize,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 0,
  height: 0.6,
  aim: [0, 0, 0],
  from: [0, 0.2, 1],
  fov: 20,
} as const;
/** Lean under the pointer, radians (about 4 degrees), and the seat drop. */
const LEAN = 0.07;
const DROP = 0.08;

const dummy = new Object3D();

/**
 * Two register pins at the job image's top corners, the image hung on
 * them. They lean with the pointer over the image; clicking the image
 * seats them (a 60ms drop and the register-pin voice). With motion off
 * they stand seated.
 */
function createPins(el: HTMLElement | null): ViewWorld {
  const m = inks();
  const root = new Group();
  const shafts = new InstancedMesh(
    new CylinderGeometry(0.035, 0.035, 0.34, 12).translate(0, -0.1, 0),
    m.inkSoft,
    2
  );
  const heads = new InstancedMesh(new SphereGeometry(0.07, 14, 10), m.ink, 2);
  root.add(shafts, heads);
  const image = el?.parentElement ?? null;
  const pointer = trackPointer(image, 1);
  const d = createDamp({ lean: 0, seat: 0 });
  let seatUntil = -1;
  let now = 0;
  const seat = () => {
    if (isSoundOn()) playVoice(pressVoices.pins);
    if (!motionOn()) return;
    seatUntil = now + 0.06;
    kick();
  };
  image?.addEventListener("click", seat);

  return {
    root,
    frame(delta) {
      now += delta;
      const live = motionOn();
      const { width } = visibleSize(el, FIT);
      const seating = live && now < seatUntil;
      if (seating) d.hold();
      d.to(
        "lean",
        live && pointer.p.inside ? pointer.p.x * LEAN : 0,
        0.14,
        delta
      );
      d.to("seat", seating || !live ? 1 : 0, seating ? 0.7 : 0.2, delta);
      const x = width / 2 - 0.25;
      [-x, x].forEach((px, i) => {
        dummy.position.set(px, 0.05 - d.v.seat * DROP, 0);
        dummy.rotation.set(0, 0, -d.v.lean);
        dummy.updateMatrix();
        shafts.setMatrixAt(i, dummy.matrix);
        dummy.position.y += 0.08;
        dummy.updateMatrix();
        heads.setMatrixAt(i, dummy.matrix);
      });
      shafts.instanceMatrix.needsUpdate = true;
      heads.instanceMatrix.needsUpdate = true;
      d.end();
    },
    dispose() {
      pointer.dispose();
      image?.removeEventListener("click", seat);
    },
  };
}

export const Pins = () => (
  <PressView id={VIEW.pins} fit={FIT} create={createPins} />
);
