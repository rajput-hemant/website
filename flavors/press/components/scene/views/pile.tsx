import { VIEW } from "@/flavors/press/lib/scene/views";
import {
  BoxGeometry,
  ConeGeometry,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
} from "three";

import { motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import {
  createDamp,
  hoveredKey,
  inkColour,
  inks,
  onTheme,
  pageProgress,
  PressView,
  readData,
  whiteMaterial,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 2.2,
  height: 1.9,
  aim: [0, 0.6, 0],
  from: [0.55, 0.5, 1],
  fov: 24,
} as const;
/** The whole pile's height, split between runs by their length. */
const PILE = 1.2;
const MIN = 0.05;
const FAN = 0.1;

const dummy = new Object3D();

/**
 * The delivery pile beside the job tickets: one sheet per run, as thick as
 * the run was long, newest on top. Reading down the tickets (the page's
 * `[data-scene-section]`) moves a pointer down the pile; pointing at a
 * ticket fans its sheet out. With motion off nothing fans.
 */
function createPile(el: HTMLElement | null): ViewWorld {
  const { runs } = readData<typeof VIEW.pile>(el, { runs: [] });
  const total = runs.reduce((sum, r) => sum + Math.max(0.001, r.share), 0);
  const heights = runs.map((r) =>
    Math.max(MIN, (Math.max(0.001, r.share) / Math.max(0.001, total)) * PILE)
  );
  const top = heights.reduce((a, b) => a + b, 0);
  const sheets = new InstancedMesh(
    new BoxGeometry(1.2, 1, 0.9),
    whiteMaterial(0.95),
    Math.max(1, runs.length)
  );
  sheets.count = runs.length;
  const arrow = new Mesh(
    new ConeGeometry(0.07, 0.2, 12).rotateZ(-Math.PI / 2),
    inks().pink
  );
  const root = new Group();
  root.add(sheets, arrow);
  const colours = () => {
    // Alternate the stock so neighbouring runs read as separate sheets.
    runs.forEach((_, i) => {
      sheets.setColorAt(i, inkColour(i % 2 ? "shade" : "sheet"));
    });
    if (sheets.instanceColor) sheets.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);
  const progress = pageProgress();
  const d = createDamp({ read: 0 });
  const fans = createDamp(Object.fromEntries(runs.map((r) => [r.id, 0])));

  return {
    root,
    frame(delta) {
      const key = hoveredKey(sceneStore.getState().hovered, "run");
      const live = motionOn();
      let y = top;
      runs.forEach((run, i) => {
        const h = heights[i] ?? MIN;
        y -= h;
        fans.to(run.id, live && run.id === key ? FAN : 0, 0.18, delta);
        const fan = fans.v[run.id] ?? 0;
        dummy.position.set(fan, y + h / 2, 0);
        dummy.rotation.set(0, -fan * 1.5, 0);
        dummy.scale.set(1, h * 0.92, 1);
        dummy.updateMatrix();
        sheets.setMatrixAt(i, dummy.matrix);
      });
      sheets.instanceMatrix.needsUpdate = true;
      d.to("read", progress(), 0.2, delta);
      arrow.position.set(-0.78, (1 - d.v.read) * top, 0.2);
      d.end();
      fans.end();
    },
    dispose: offTheme,
  };
}

export const Pile = () => (
  <PressView id={VIEW.pile} fit={FIT} create={createPile} />
);
