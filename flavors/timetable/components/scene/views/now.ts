import { CylinderGeometry, Matrix4, Mesh } from "three";

import { glyphGeometry, glyphMaterial } from "./glyphs";
import {
  all,
  fitCamera,
  group,
  lights,
  spring0,
  standard,
  step,
  themed,
  type ViewObject,
} from "./kit";

const DRUM = { r: 0.62, w: 1.9 };

/**
 * /now: a year drum beside the year links. Each face carries a year
 * printed from the flap atlas; reading through the updates rolls it to the
 * year in view, and clicking it goes to that year's updates.
 */
export function createYearDrum(host: HTMLElement): ViewObject {
  const headings = [
    ...document.querySelectorAll<HTMLElement>('#updates h3[id^="log-"]'),
  ];
  const years = headings.map((h) => h.id.slice(4));
  const faces = Math.max(4, years.length);
  const step0 = (Math.PI * 2) / faces;
  // The faces' apothem, so the plates sit flat on them.
  const apothem = DRUM.r * Math.cos(step0 / 2);
  const root = group();
  lights(root);
  const shell = standard({ color: "#1b2025", metalness: 0.45 });
  const geometry = new CylinderGeometry(DRUM.r, DRUM.r, DRUM.w, faces);
  // Lying on its side, a face towards the reader, turning about x.
  geometry.rotateZ(Math.PI / 2);
  geometry.rotateX(step0 / 2);
  const body = new Mesh(geometry, shell);
  const plates = new Mesh(
    glyphGeometry(
      years.map((year, i) => ({
        text: year,
        w: 0.3,
        h: 0.46,
        yellow: i === 0,
        matrix: new Matrix4()
          .makeRotationX(-i * step0)
          .multiply(new Matrix4().makeTranslation(0, 0, apothem + 0.004)),
      }))
    ),
    glyphMaterial()
  );
  const drum = group(body, plates);
  root.add(drum);
  const view = fitCamera(22);
  const roll = spring0();
  let at = 0;

  const yearInView = () => {
    let found = 0;
    headings.forEach((h, i) => {
      if (h.getBoundingClientRect().top < innerHeight * 0.45) found = i;
    });
    return found;
  };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(
        width,
        height,
        [DRUM.w + 0.2, DRUM.r * 2 + 0.2],
        [0, 0, 0],
        [0.3, 0.2, 1]
      );
      at = yearInView();
      const moving = step(roll, at * step0, 0.07, 0.8);
      drum.rotation.x = roll.x;
      return moving;
    },
    bind() {
      const go = () => {
        const year = years[at];
        if (year) location.hash = `log-${year}`;
      };
      host.addEventListener("click", go);
      return all(
        () => host.removeEventListener("click", go),
        themed((token) => shell.color.set(token("--color-board")))
      );
    },
  };
}
