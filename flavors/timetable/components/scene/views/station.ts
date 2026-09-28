import { kick, motionOn } from "@/lib/scene/clock";

import { createClockFace } from "../clock-face";
import {
  all,
  bindHover,
  fitCamera,
  group,
  lights,
  themed,
  type ViewObject,
} from "./kit";

const TAU = Math.PI * 2;
const R = 0.62;
/** One pass of the seconds hand when the clock is pointed at. */
const SWEEP = 1.5;

/**
 * Home: the station clock beside "Service updates". The minute hand jumps
 * once a minute (one kicked frame); pointing at the clock plays a single
 * 1.5s sweep of the seconds hand, which otherwise waits at twelve.
 */
export function createStationClock(host: HTMLElement): ViewObject {
  const face = createClockFace(R, { seconds: true, minuteTicks: true });
  const root = group(face.group);
  lights(root);
  const view = fitCamera(24);
  face.group.rotation.y = -0.18;
  let sweep = -1;

  return {
    root,
    camera: view.camera,
    frame(delta, width, height) {
      view.fit(width, height, [R * 2 + 0.2, R * 2 + 0.2]);
      if (sweep < 0 || !face.second) return false;
      sweep += delta / SWEEP;
      if (sweep >= 1) sweep = -1;
      // Eased in and out, like the real hand's stop-to-go.
      const t = sweep < 0 ? 0 : sweep;
      face.second.rotation.z = -TAU * (t * t * (3 - 2 * t));
      return sweep >= 0;
    },
    bind() {
      let timer = 0;
      const tick = () => {
        const now = new Date();
        face.set(now);
        kick();
        timer = window.setTimeout(
          tick,
          60_000 - (now.getSeconds() * 1000 + now.getMilliseconds())
        );
      };
      tick();
      return all(
        () => clearTimeout(timer),
        bindHover(host, (inside) => {
          if (inside && sweep < 0 && motionOn()) sweep = 0;
        }),
        // The hands stay ink on the enamel dial in both themes.
        themed((token) => face.signal.color.set(token("--color-signal")))
      );
    },
  };
}
