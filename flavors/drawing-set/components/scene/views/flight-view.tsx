import { Group, Matrix4 } from "three";

import { kick } from "@/lib/scene/clock";

import { Linework } from "../linework";
import * as M from "../models";
import { acceptFlights, trayMark } from "./flight-bus";
import { compose, type ViewFrame, type ViewModel } from "./kit";

/** The slip model's width (models.ts `slip`). */
const SLIP = 1.35;
const FOLD = 0.16;
const FLIGHT = 0.6;

type Point = { x: number; y: number; width: number };
type Flight = { from: Point; to: Point; t: number; land: () => void };

const ease = (t: number) => 1 - (1 - t) ** 3;

/**
 * Ask K1: sending an RFI folds a slip off the composer (160ms) and flies it
 * along a curve into the tray on the desk above (600ms), where the world
 * drops it in. The view spans the slot and the composer, so one object can
 * cross both. With motion off, or with the tray off screen, nothing flies
 * and the slip simply appears in the tray.
 */
export function createFlight(): ViewModel {
  const group = new Group();
  const slip = new Linework(M.slip());
  group.add(slip.group);
  const m = new Matrix4();
  let flight: Flight | null = null;

  function frame(f: ViewFrame) {
    const go = flight;
    if (!go) {
      slip.commit(0);
      return;
    }
    go.t = Math.min(1, go.t + f.dt / (FOLD + FLIGHT));
    const fold = Math.min(1, (go.t * (FOLD + FLIGHT)) / FOLD);
    const fly = ease(Math.max(0, (go.t * (FOLD + FLIGHT) - FOLD) / FLIGHT));
    const { from, to } = go;
    // A quadratic curve that rises before it drops into the tray.
    const cx = (from.x + to.x) / 2;
    const cy = Math.max(from.y, to.y) + 80;
    const u = 1 - fly;
    const x = u * u * from.x + 2 * u * fly * cx + fly * fly * to.x;
    const y = u * u * from.y + 2 * u * fly * cy + fly * fly * to.y;
    const k = (from.width + (to.width - from.width) * fly) / SLIP;
    compose(
      m,
      [x, y, 0],
      [1.2 - fold * 0.5 - fly * 0.2, (1 - fly) * 0.3, 0],
      [k, k, k * (1 - fold * 0.45 * (1 - fly))]
    );
    slip.setMatrix(0, m);
    slip.setHot(0, 1);
    slip.commit(1);
    if (go.t >= 1) {
      flight = null;
      go.land();
    }
    kick();
  }

  function bind(el: HTMLElement) {
    acceptFlights((land) => {
      const tray = trayMark();
      // The composer that was just sent (it keeps focus), else the page's first.
      const origin =
        document.activeElement?.closest("[data-slip-origin]") ??
        document.querySelector("[data-slip-origin]");
      const motion = document.documentElement.dataset.motion === "on";
      if (!tray || !origin || !motion) return false;
      if (tray.y < 0 || tray.y > innerHeight) return false;
      const box = el.getBoundingClientRect();
      const o = origin.getBoundingClientRect();
      // Into the view's frame: centred, y up.
      const local = (x: number, y: number) => ({
        x: x - (box.left + box.width / 2),
        y: box.top + box.height / 2 - y,
      });
      flight?.land();
      flight = {
        from: {
          ...local(o.left + o.width / 2, o.top + 24),
          width: Math.min(180, o.width * 0.4),
        },
        to: { ...local(tray.x, tray.y), width: tray.width },
        t: 0,
        land,
      };
      kick();
      return true;
    });
    return () => {
      acceptFlights(null);
      flight?.land();
      flight = null;
    };
  }

  return { group, aim: { az: 0, el: 0 }, frame, bind };
}
