import { OWNER_ON_BOARD } from "@/flavors/timetable/lib/board";
import { playSceneVoice } from "@/flavors/timetable/lib/sound/voices";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import { kick, motionOn, tween } from "@/lib/scene/clock";
import { sceneStore, type SceneState } from "@/lib/scene/store";

import {
  all,
  bindDrag,
  bindHover,
  clamp,
  fitCamera,
  group,
  lights,
  spring0,
  standard,
  step,
  themed,
  type ViewObject,
} from "./kit";

/**
 * The yard's hardware: the /lab turntable, the /resume ticket printer, the
 * /owner lever frame and the 404 buffer stop.
 */

const DECK = { r: 1.3, h: 0.12 };

/**
 * /lab: a railway turntable above the experiments. Pointing at a card
 * turns the deck to face it (a 500ms glide); a drag spins it, and it
 * settles back when let go.
 */
export function createTurntable(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  const pitMaterial = standard({ color: "#20252a", metalness: 0.2 });
  const pit = new Mesh(
    new CylinderGeometry(DECK.r + 0.12, DECK.r + 0.12, 0.08, 48),
    pitMaterial
  );
  pit.position.y = -0.1;
  const deckMaterial = standard({ color: "#3a4148", metalness: 0.4 });
  const deckMesh = new Mesh(
    new CylinderGeometry(DECK.r, DECK.r, DECK.h, 48),
    deckMaterial
  );
  const railMaterial = standard({
    color: "#c9ced3",
    metalness: 0.9,
    roughness: 0.3,
  });
  const rails = new InstancedMesh(
    new BoxGeometry(DECK.r * 2.1, 0.05, 0.05),
    railMaterial,
    2
  );
  const m = new Matrix4();
  [-0.16, 0.16].forEach((z, i) =>
    rails.setMatrixAt(i, m.makeTranslation(0, DECK.h / 2 + 0.03, z))
  );
  const deck = group(deckMesh, rails);
  root.add(pit, deck);
  const view = fitCamera(24);

  const yaw = spring0();
  let target = 0;
  let drag = 0;
  const update = (state: SceneState) => {
    const cards = state.items.filter((item) => item.id.startsWith("study:"));
    const i = cards.findIndex((item) => item.id === state.hovered);
    target = i < 0 ? 0 : (i - (cards.length - 1) / 2) * 0.55;
  };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height, [DECK.r * 2.6, 1.2], [0, 0, 0], [0, 1.1, 1]);
      const moving = step(
        yaw,
        target + drag,
        drag ? 0.2 : 0.08,
        drag ? 0.7 : 0.82
      );
      deck.rotation.y = -yaw.x;
      return moving;
    },
    bind() {
      update(sceneStore.getState());
      return all(
        sceneStore.subscribe(update),
        bindDrag(host, {
          move: (d) => (drag = d.dx * 0.015),
          end: () => (drag = 0),
        }),
        themed((token) => pitMaterial.color.set(token("--color-cell-deep")))
      );
    },
  };
}

const TICKET = { w: 0.7, d: 0.02, feed: 0.08, full: 0.9 };

/**
 * /resume: a ticket printer on "Print / Save as PDF". Pointing at the
 * button feeds 8mm of ticket; pressing it feeds a whole one while the
 * print dialog opens on the next frame.
 */
export function createPrinter(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  const casing = standard({ color: "#14191e", metalness: 0.45 });
  const body = new Mesh(new BoxGeometry(1, 0.55, 0.7), casing);
  const paper = standard({ color: "#f4f6f7", roughness: 0.85, metalness: 0 });
  const geometry = new BoxGeometry(TICKET.w, 1, TICKET.d);
  // Grows up out of the slot on the printer's top.
  geometry.translate(0, 0.5, 0);
  const ticket = new Mesh(geometry, paper);
  ticket.position.set(0, 0.26, 0.05);
  const printer = group(body, ticket);
  printer.rotation.set(0.3, -0.45, 0);
  root.add(printer);
  const view = fitCamera(24);
  const feed = spring0(0.001);
  let target = 0.001;

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height, [1.6, 1.7], [0, 0.45, 0], [0, 0.2, 1]);
      const moving = step(feed, target, 0.12, 0.72);
      ticket.scale.y = Math.max(0.001, feed.x);
      return moving;
    },
    bind() {
      const button = host.parentElement?.querySelector("[data-printer]");
      const press = () => {
        target = TICKET.full;
        kick();
      };
      button?.addEventListener("click", press);
      return all(
        () => button?.removeEventListener("click", press),
        button
          ? bindHover(button, (inside) => {
              if (target !== TICKET.full || !inside)
                target = inside ? TICKET.feed : 0.001;
            })
          : () => {},
        themed((token) => casing.color.set(token("--color-ink")))
      );
    },
  };
}

const LEVERS = 3;
/** Signal (red, the one that clears), points (black), lock (blue). */
const LEVER_COLOURS = ["--color-line-1", "--color-ink", "--color-line-3"];
const CLEAR = 0;
const THROW = 0.75;

/**
 * /owner: a signal-box lever frame beside the sign-in. A drag throws the
 * lever under the pointer (and leaves it thrown past halfway); signing in
 * pulls the red "clear" lever while the indicator reads STAFF, SIGNED IN.
 */
export function createLevers(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  const frameMaterial = standard({ color: "#20252a", metalness: 0.5 });
  const base = new BoxGeometry(1.8, 0.2, 0.6);
  const quadrant = new BoxGeometry(1.8, 0.08, 0.08);
  quadrant.translate(0, 0.14, -0.26);
  const frame = new Mesh(
    mergeGeometries([base, quadrant]) ?? base,
    frameMaterial
  );
  const leverGeometry = new BoxGeometry(0.12, 1.2, 0.08);
  // Pivot at the frame: the lever rises from its foot.
  leverGeometry.translate(0, 0.6, 0);
  const levers = new InstancedMesh(
    leverGeometry,
    new MeshStandardMaterial({ roughness: 0.4, metalness: 0.3 }),
    LEVERS
  );
  const machine = group(frame, levers);
  machine.position.y = -0.5;
  root.add(machine);
  const view = fitCamera(24);

  const pull = Array.from({ length: LEVERS }, () => spring0());
  const thrown = Array.from({ length: LEVERS }, () => false);
  let dragging: { i: number; amount: number } | null = null;
  let signedIn = false;
  const m = new Matrix4();
  const colours = LEVER_COLOURS.map(() => new Color());
  const place = () => {
    pull.forEach((s, i) => {
      m.makeRotationX(s.x * THROW).setPosition((i - 1) * 0.5, 0.1, 0);
      levers.setMatrixAt(i, m);
    });
    levers.instanceMatrix.needsUpdate = true;
  };
  const target = (i: number) => {
    if (dragging?.i === i) return dragging.amount;
    return thrown[i] || (i === CLEAR && signedIn) ? 1 : 0;
  };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height, [2, 1.6], [0, 0.1, 0], [0.35, 0.45, 1]);
      let moving = false;
      pull.forEach((s, i) => {
        moving = step(s, target(i), 0.12, 0.72) || moving;
      });
      place();
      return moving;
    },
    bind() {
      const update = (state: SceneState) => {
        const next = state.board === OWNER_ON_BOARD;
        if (next === signedIn) return;
        signedIn = next;
        kick();
      };
      update(sceneStore.getState());
      let picked = 0;
      return all(
        sceneStore.subscribe(update),
        bindDrag(host, {
          down: (e) => {
            const r = host.getBoundingClientRect();
            picked = clamp(
              Math.floor(((e.clientX - r.left) / r.width) * LEVERS),
              0,
              LEVERS - 1
            );
          },
          move: (d) => {
            // Pulled toward the reader: down with a mouse, sideways on touch.
            const from = thrown[picked] ? 1 : 0;
            const by = (d.dy || Math.abs(d.dx)) / 90;
            dragging = {
              i: picked,
              amount: clamp(from + (from ? -by : by), 0, 1),
            };
          },
          end: () => {
            if (!dragging) return;
            const was = thrown[dragging.i] ?? false;
            thrown[dragging.i] = dragging.amount > 0.5;
            if (thrown[dragging.i] !== was) playSceneVoice("clunk");
            dragging = null;
          },
        }),
        themed((token) => {
          LEVER_COLOURS.forEach((name, i) => {
            const colour = colours[i];
            if (colour) levers.setColorAt(i, colour.set(token(name)));
          });
          if (levers.instanceColor) levers.instanceColor.needsUpdate = true;
        })
      );
    },
  };
}

const TRACK = { from: -2.4, to: 2.4 };
const CAR = { w: 1.4, h: 0.62, d: 0.7 };
const STOP_X = 1.75;
const REST_X = -0.9;

/**
 * 404: the end of the line. Drag the carriage into the buffer stop and it
 * bounces off it with a clunk; let go and it rolls back. Pointing at the
 * carriage lights its red tail lamp; nothing blinks.
 */
export function createBufferStop(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  // Rails and sleepers are one instanced unit box, scaled per instance.
  const SLEEPERS = 9;
  const track = new InstancedMesh(
    new BoxGeometry(1, 1, 1),
    standard({ metalness: 0.5 }),
    SLEEPERS + 2
  );
  const m = new Matrix4();
  const steel = new Color("#9aa4ad");
  const timber = new Color("#4b3a2c");
  for (let i = 0; i < SLEEPERS; i++) {
    const x = TRACK.from + 0.3 + (i * (TRACK.to - TRACK.from - 0.6)) / 8;
    track.setMatrixAt(i, m.makeScale(0.16, 0.06, 1).setPosition(x, -0.03, 0));
    track.setColorAt(i, timber);
  }
  [-0.3, 0.3].forEach((z, j) => {
    track.setMatrixAt(
      SLEEPERS + j,
      m.makeScale(TRACK.to - TRACK.from, 0.06, 0.05).setPosition(0, 0.03, z)
    );
    track.setColorAt(SLEEPERS + j, steel);
  });
  const stopMaterial = standard({ color: "#d52b1e", metalness: 0.3 });
  const beam = new BoxGeometry(0.2, 0.3, 0.9);
  beam.translate(STOP_X + 0.3, 0.45, 0);
  const post = new BoxGeometry(0.16, 0.5, 0.16);
  post.translate(STOP_X + 0.35, 0.25, 0);
  const buffers = [-0.25, 0.25].map((z) => {
    const g = new CylinderGeometry(0.07, 0.07, 0.24, 12);
    g.rotateZ(Math.PI / 2);
    g.translate(STOP_X + 0.1, 0.45, z);
    return g;
  });
  const stop = new Mesh(
    mergeGeometries([beam, post, ...buffers]) ?? beam,
    stopMaterial
  );
  const carMaterial = standard({ color: "#14191e", metalness: 0.35 });
  const car = new Mesh(new BoxGeometry(CAR.w, CAR.h, CAR.d), carMaterial);
  const lampMaterial = standard({
    color: "#b3261e",
    emissive: new Color("#ff2a1a"),
    emissiveIntensity: 0,
  });
  const lamp = new Mesh(new SphereGeometry(0.07, 14, 10), lampMaterial);
  lamp.position.set(-CAR.w / 2 - 0.02, -0.08, 0.2);
  const carriage = group(car, lamp);
  carriage.position.y = CAR.h / 2 + 0.12;
  root.add(track, stop, carriage);
  const view = fitCamera(24);

  const x = spring0(REST_X);
  let target = REST_X;
  let contact = false;
  const limit = STOP_X - CAR.w / 2 - 0.02;

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(
        width,
        height,
        [TRACK.to - TRACK.from, 1.4],
        [0, 0.45, 0],
        [0.35, 0.35, 1]
      );
      const moving = step(x, target, 0.12, 0.8);
      // Buffers don't give: meeting them turns the carriage's way round.
      if (x.x > limit) {
        x.x = limit;
        const speed = x.v;
        x.v = -Math.abs(x.v) * 0.45;
        if (!contact && speed > 0.02) playSceneVoice("clunk");
        contact = true;
      } else if (x.x < limit - 0.05) {
        contact = false;
      }
      carriage.position.x = x.x;
      return moving;
    },
    bind() {
      return all(
        bindDrag(host, {
          move: (d) => {
            target = clamp(REST_X + d.dx / 60, TRACK.from + CAR.w / 2, limit);
          },
          end: () => (target = REST_X),
        }),
        bindHover(host, (inside) => {
          tween(lampMaterial, {
            emissiveIntensity: inside ? 1 : 0,
            duration: motionOn() ? 0.2 : 0,
            ease: "power2.out",
          });
        }),
        themed((token) => carMaterial.color.set(token("--color-ink")))
      );
    },
  };
}
