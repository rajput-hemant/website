import { glyphOf, toDrum } from "@/flavors/timetable/lib/board";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { sceneStore, type SceneState } from "@/lib/scene/store";

import { createModules, sharedAtlas, turnModules } from "../flaps";
import {
  all,
  fitCamera,
  group,
  lights,
  standard,
  themed,
  type ViewObject,
} from "./kit";

/** The 3D modules turn at the indicator's pace. */
const FLIP = 0.055;
const CELL = { w: 1.12, h: 1.6, gap: 0.15 };

/**
 * /projects: the board's count on real flap modules, laid over the DOM
 * count (which stays for screen readers and keeps turning underneath, so
 * its riffle sound is the one you hear). A filter turns the modules to the
 * new count in drum order, column by column.
 */
export function createCounter(host: HTMLElement): ViewObject {
  const count = host.closest("[data-board-count]") ?? host;
  const cells = Math.max(
    1,
    count.querySelector("[data-flap]")?.children.length ?? 2
  );
  const flaps = createModules(
    sharedAtlas().texture,
    [{ n: cells, w: CELL.w, h: CELL.h, y: 0 }],
    CELL.gap
  );
  const root = group(...flaps.meshes);
  const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);

  let time = 0;
  let value = "";
  const read = () =>
    count.querySelector(".sr-only")?.textContent?.trim() ?? count.textContent;
  const show = (next: string) => {
    const text = toDrum(next).padStart(cells).slice(-cells);
    if (text === value) return;
    const first = value === "";
    value = text;
    flaps.modules.forEach((m, c) => {
      m.target = glyphOf(text[c] ?? " ", true);
      if (first || !motionOn()) {
        m.cur = m.target;
        m.next = null;
      } else if (m.next === null) {
        m.t0 = time + c * 0.022;
      }
    });
    kick();
  };

  return {
    root,
    camera,
    frame(delta, width, height) {
      time += delta;
      // The box is the DOM count's: the height fits a cell, width follows.
      const half = (CELL.h / 2) * (width / Math.max(1, height));
      camera.left = -half;
      camera.right = half;
      camera.top = CELL.h / 2;
      camera.bottom = -CELL.h / 2;
      camera.updateProjectionMatrix();
      const { busy } = turnModules(flaps.modules, time, FLIP);
      flaps.sync(time, FLIP);
      return busy;
    },
    bind() {
      show(read() ?? "");
      const observer = new MutationObserver(() => show(read() ?? ""));
      observer.observe(count, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      return () => observer.disconnect();
    },
  };
}

type Tone = "on" | "late" | "off";
const ASPECTS: readonly Tone[] = ["on", "late", "off"];
const LENS_R = 0.3;

/**
 * /projects: a three-aspect signal head beside the legend. Pointing at a
 * departure lights the aspect for its status (green on time, yellow
 * delayed, red cancelled); at rest it shows green.
 */
export function createSignalHead(): ViewObject {
  const root = group();
  lights(root);
  const head = group();
  root.add(head);
  const plate = standard({ color: "#14191e", metalness: 0.4 });
  const back = new Mesh(new BoxGeometry(0.95, 2.35, 0.2), plate);
  const lensGeometry = new CylinderGeometry(LENS_R, LENS_R, 0.06, 28);
  lensGeometry.rotateX(Math.PI / 2);
  const lenses = new InstancedMesh(
    lensGeometry,
    new MeshBasicMaterial({ color: "#ffffff" }),
    3
  );
  const hoodGeometry = new CylinderGeometry(
    LENS_R + 0.07,
    LENS_R + 0.07,
    0.26,
    24,
    1,
    true,
    -Math.PI / 2,
    Math.PI
  );
  hoodGeometry.rotateX(Math.PI / 2);
  const hoods = new InstancedMesh(hoodGeometry, plate, 3);
  const m = new Matrix4();
  ASPECTS.forEach((_, i) => {
    const y = 0.72 - i * 0.72;
    lenses.setMatrixAt(i, m.makeTranslation(0, y, 0.12));
    hoods.setMatrixAt(i, m.makeTranslation(0, y, 0.24));
  });
  head.add(back, lenses, hoods);
  head.rotation.y = -0.4;
  const view = fitCamera(24);

  const lit: Record<Tone, Color> = {
    on: new Color("#00874e"),
    late: new Color("#ffc20e"),
    off: new Color("#d52b1e"),
  };
  const dark = new Color("#2a3036");
  const shown = ASPECTS.map(() => new Color(dark));
  const target = ASPECTS.map(() => new Color(dark));
  let tone: Tone = "on";

  const paint = () => {
    ASPECTS.forEach((aspect, i) => {
      const colour = aspect === tone ? lit[aspect] : dark;
      target[i]?.copy(colour).lerp(dark, aspect === tone ? 0 : 0.2);
    });
    kick();
  };
  const update = (state: SceneState) => {
    const id = state.hovered;
    const row = id?.startsWith("project:")
      ? document.querySelector<HTMLElement>(
          `[data-scene-item="${CSS.escape(id)}"][data-status-tone]`
        )
      : null;
    const next = row?.dataset.statusTone;
    const nextTone: Tone =
      next === "late" || next === "off" || next === "on" ? next : "on";
    if (nextTone === tone) return;
    tone = nextTone;
    paint();
  };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height, [1.3, 2.6]);
      let moving = false;
      shown.forEach((colour, i) => {
        const to = target[i];
        if (!to) return;
        if (motionOn()) colour.lerp(to, 0.25);
        else colour.copy(to);
        const far =
          Math.abs(colour.r - to.r) +
          Math.abs(colour.g - to.g) +
          Math.abs(colour.b - to.b);
        if (far < 0.004) colour.copy(to);
        else moving = true;
        lenses.setColorAt(i, colour);
      });
      if (lenses.instanceColor) lenses.instanceColor.needsUpdate = true;
      return moving;
    },
    bind() {
      paint();
      update(sceneStore.getState());
      return all(
        sceneStore.subscribe(update),
        themed((token) => {
          lit.on.set(token("--color-line-4"));
          lit.off.set(token("--color-line-1"));
          lit.late.set(token("--color-signal"));
          paint();
        })
      );
    },
  };
}
