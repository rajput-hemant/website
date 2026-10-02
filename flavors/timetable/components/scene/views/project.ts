import {
  BoxGeometry,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { kick, motionOn } from "@/lib/scene/clock";

import {
  all,
  bindHover,
  clamp,
  fitCamera,
  group,
  lights,
  pxCamera,
  readThrough,
  spring0,
  standard,
  step,
  themed,
  type ViewObject,
} from "./kit";

const TICKET = { w: 3.4, h: 1.8, d: 0.05 };
/** Holes the ticket takes before it starts again from the first. */
const HOLES = 6;
/** How long a punched chad takes to fall out of view. */
const DROP = 0.12;

/**
 * /projects/[slug]: an Edmondson card ticket beside "Board the live
 * service". Pointing at the ticket or the button lifts it 4 degrees;
 * boarding punches a hole (with the button's own clunk) and the chad drops,
 * without holding the link, which opens in a new tab.
 */
export function createTicket(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  const card = standard({ color: "#efe4c8", roughness: 0.8, metalness: 0 });
  const ticket = new Mesh(
    new RoundedBoxGeometry(TICKET.w, TICKET.h, TICKET.d, 2, 0.08),
    card
  );
  const stripeMaterial = new MeshBasicMaterial({ color: "#39424a" });
  const stripe = new Mesh(
    new PlaneGeometry(TICKET.w, TICKET.h * 0.2),
    stripeMaterial
  );
  stripe.position.set(0, TICKET.h * 0.22, TICKET.d / 2 + 0.002);
  const holeGeometry = new CylinderGeometry(0.09, 0.09, TICKET.d + 0.01, 16);
  holeGeometry.rotateX(Math.PI / 2);
  // HOLES punched holes, then the falling chad.
  const holes = new InstancedMesh(
    holeGeometry,
    standard({ color: "#14191e" }),
    HOLES + 1
  );
  holes.count = 0;
  const pivot = group(ticket, stripe, holes);
  root.add(pivot);
  const view = fitCamera(24);

  const lift = spring0();
  let over = { ticket: false, button: false };
  let punched = 0;
  let chad = -1;
  const m = new Matrix4();
  const holeAt = (i: number) => [
    -TICKET.w / 2 + 0.35 + i * 0.3,
    -TICKET.h / 2 + 0.3,
  ];
  const place = () => {
    const shown = Math.min(punched, HOLES);
    for (let i = 0; i < shown; i++) {
      const [x = 0, y = 0] = holeAt(i);
      holes.setMatrixAt(i, m.makeTranslation(x, y, 0));
    }
    holes.count = shown;
    if (chad >= 0) {
      const [x = 0, y = 0] = holeAt((punched - 1) % HOLES);
      const t = chad / DROP;
      holes.setMatrixAt(shown, m.makeTranslation(x, y - t * 1.4, -0.1 - t));
      holes.count = shown + 1;
    }
    holes.instanceMatrix.needsUpdate = true;
  };

  return {
    root,
    camera: view.camera,
    frame(delta, width, height) {
      view.fit(
        width,
        height,
        [TICKET.w + 0.5, TICKET.h + 0.6],
        [0, 0, 0],
        [-0.35, 0.25, 1]
      );
      const lifted = over.ticket || over.button;
      const moving = step(lift, lifted ? 1 : 0, 0.08, 0.8);
      pivot.rotation.x = (-4 * Math.PI * lift.x) / 180;
      pivot.position.z = lift.x * 0.12;
      if (chad >= 0) {
        chad += delta;
        if (chad >= DROP) chad = -1;
        place();
      }
      return moving || chad >= 0;
    },
    bind() {
      const button = document.querySelector("[data-ticket-punch]");
      const punch = () => {
        if (punched >= HOLES) punched = 0;
        punched++;
        chad = motionOn() ? 0 : -1;
        place();
        kick();
      };
      button?.addEventListener("click", punch);
      return all(
        () => button?.removeEventListener("click", punch),
        bindHover(host, (inside) => (over = { ...over, ticket: inside })),
        button
          ? bindHover(button, (inside) => (over = { ...over, button: inside }))
          : () => {},
        themed((token) => stripeMaterial.color.set(token("--color-signal")))
      );
    },
  };
}

const WHEEL = { r: 5, w: 20 };
const BODY = { w: 16, h: 26 };

/**
 * /projects/[slug]: a bogie on the calling pattern's rail. As the reader
 * goes through "Calling at" it runs stop to stop, easing into each one.
 */
export function createBogie(host: HTMLElement): ViewObject {
  const list = host.parentElement?.querySelector("ol");
  const view = pxCamera();
  const root = group();
  lights(root);
  const bodyMaterial = standard({ color: "#14191e", metalness: 0.4 });
  const body = new Mesh(new BoxGeometry(BODY.w, BODY.h, 10), bodyMaterial);
  const wheelGeometry = new CylinderGeometry(WHEEL.r, WHEEL.r, WHEEL.w, 16);
  wheelGeometry.rotateZ(Math.PI / 2);
  const wheels = new InstancedMesh(
    wheelGeometry,
    standard({ color: "#9aa4ad", metalness: 0.8, roughness: 0.3 }),
    2
  );
  const m = new Matrix4();
  wheels.setMatrixAt(0, m.makeTranslation(0, BODY.h / 2 - 3, -4));
  wheels.setMatrixAt(1, m.makeTranslation(0, -BODY.h / 2 + 3, -4));
  const bogie = group(body, wheels);
  // Tipped toward the reader, so the wheelsets show beside the frame.
  bogie.rotation.set(-0.5, 0.35, 0);
  root.add(bogie);

  let stops: number[] = [];
  const measure = () => {
    const top = host.getBoundingClientRect().top;
    stops = [...(list?.children ?? [])].map((li) => {
      const r = li.getBoundingClientRect();
      return r.top + r.height / 2 - top;
    });
    kick();
  };
  const y = spring0(-1);

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height);
      if (!stops.length) return false;
      const section = host.closest("section") ?? host;
      const i = Math.round(readThrough(section) * (stops.length - 1));
      const target = stops[clamp(i, 0, stops.length - 1)] ?? 0;
      if (y.x < 0) y.x = target;
      const moving = step(y, target, 0.07, 0.78);
      bogie.position.set(width / 2, -y.x, 20);
      return moving;
    },
    bind() {
      measure();
      const ro = new ResizeObserver(measure);
      if (list) ro.observe(list);
      return all(
        () => ro.disconnect(),
        themed((token) => bodyMaterial.color.set(token("--color-ink")))
      );
    },
  };
}
