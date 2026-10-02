import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
} from "three";

import { kick } from "@/lib/scene/clock";
import { sceneStore, type SceneState } from "@/lib/scene/store";

import { glyphGeometry, glyphMaterial } from "./glyphs";
import {
  all,
  bindDrag,
  fitCamera,
  group,
  lights,
  spring0,
  standard,
  step,
  themed,
  type ViewObject,
} from "./kit";

/** The station guide's four sections, one pylon face each, in page order. */
const FACES = ["guide", "facilities", "history", "desk"] as const;
const PYLON = { w: 1, h: 2.4 };

/**
 * /about: a four-faced wayfinding pylon beside "About this station". Each
 * face carries its platform plate (4A to 4D, printed from the flap atlas);
 * scrolling turns it to the section in view, and a drag spins it on a
 * spring back to that face.
 */
export function createPylon(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  const enamel = standard({ color: "#14191e", metalness: 0.35 });
  const body = new Mesh(new BoxGeometry(PYLON.w, PYLON.h, PYLON.w), enamel);
  const plates = new Mesh(
    glyphGeometry(
      FACES.map((_, i) => ({
        text: `4${"ABCD"[i] ?? ""}`,
        w: 0.3,
        h: 0.45,
        yellow: i === 0,
        matrix: new Matrix4()
          .makeRotationY((i * Math.PI) / 2)
          .multiply(new Matrix4().makeTranslation(0, 0.6, PYLON.w / 2 + 0.004)),
      }))
    ),
    glyphMaterial()
  );
  const bandMaterial = standard({ color: "#ffc20e", roughness: 0.4 });
  const band = new Mesh(
    new BoxGeometry(PYLON.w + 0.02, 0.08, PYLON.w + 0.02),
    bandMaterial
  );
  band.position.y = PYLON.h / 2 - 0.12;
  const pylon = group(body, plates, band);
  root.add(pylon);
  const view = fitCamera(22);

  const yaw = spring0();
  let drag = 0;
  let face = 0;
  const sectionInView = () => {
    let at = 0;
    FACES.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < innerHeight * 0.5) at = i;
    });
    return at;
  };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height, [1.6, PYLON.h + 0.3], [0, 0, 0], [0.5, 0.3, 1]);
      face = sectionInView();
      const moving = step(
        yaw,
        (-face * Math.PI) / 2 + drag,
        drag ? 0.2 : 0.06,
        0.85
      );
      pylon.rotation.y = yaw.x;
      return moving;
    },
    bind() {
      return all(
        bindDrag(host, {
          move: (d) => (drag = d.dx * 0.012),
          end: () => (drag = 0),
        }),
        themed((token) => {
          bandMaterial.color.set(token("--color-signal"));
          kick();
        })
      );
    },
  };
}

const POST = { r: 0.09, h: 1.1, gap: 0.62 };
const RAISE = 0.1;

/**
 * /about: one milestone post per education entry beside "Education".
 * Pointing at an entry raises its post and lights its yellow band.
 */
export function createPosts(): ViewObject {
  const ids = [
    ...document.querySelectorAll<HTMLElement>('[data-scene-item^="history:"]'),
  ].map((el) => el.dataset.sceneItem ?? "");
  const n = Math.max(1, ids.length);
  const root = group();
  lights(root);
  const postMaterial = standard({ color: "#14191e", metalness: 0.3 });
  const posts = new InstancedMesh(
    new CylinderGeometry(POST.r, POST.r * 1.15, POST.h, 14),
    postMaterial,
    n
  );
  const bands = new InstancedMesh(
    new CylinderGeometry(POST.r * 1.25, POST.r * 1.25, 0.12, 14),
    standard({ roughness: 0.4 }),
    n
  );
  root.add(posts, bands);
  const view = fitCamera(24);
  const rise = ids.map(() => spring0());
  const dim = new Color("#6b7580");
  const lit = new Color("#ffc20e");
  const shown = ids.map(() => new Color(dim));
  let hovered: string | null = null;
  const m = new Matrix4();
  const x0 = (-(n - 1) * POST.gap) / 2;

  const place = () => {
    rise.forEach((s, i) => {
      const x = x0 + i * POST.gap;
      posts.setMatrixAt(i, m.makeTranslation(x, s.x, 0));
      bands.setMatrixAt(i, m.makeTranslation(x, s.x + POST.h / 2 - 0.16, 0));
      const colour = shown[i];
      if (colour) bands.setColorAt(i, colour.copy(dim).lerp(lit, s.x / RAISE));
    });
    posts.instanceMatrix.needsUpdate = true;
    bands.instanceMatrix.needsUpdate = true;
    if (bands.instanceColor) bands.instanceColor.needsUpdate = true;
  };
  place();

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(
        width,
        height,
        [n * POST.gap + 0.3, POST.h + 0.5],
        [0, 0.05, 0],
        [0.3, 0.25, 1]
      );
      let moving = false;
      rise.forEach((s, i) => {
        moving = step(s, ids[i] === hovered ? RAISE : 0, 0.12, 0.72) || moving;
      });
      place();
      return moving;
    },
    bind() {
      const update = (state: SceneState) => {
        if (state.hovered === hovered) return;
        hovered = state.hovered;
        kick();
      };
      update(sceneStore.getState());
      return all(
        sceneStore.subscribe(update),
        themed((token) => {
          postMaterial.color.set(token("--color-ink"));
          dim.set(token("--color-ink-faint"));
          lit.set(token("--color-signal"));
          place();
        })
      );
    },
  };
}
