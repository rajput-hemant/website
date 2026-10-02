import { ITEM, VIEW } from "@/flavors/press/lib/scene/views";
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  ShaderMaterial,
  TorusGeometry,
} from "three";

import { sceneStore } from "@/lib/scene/store";

import {
  createDamp,
  hoveredKey,
  inkColour,
  inks,
  onTheme,
  PressView,
  trackPointer,
  visibleSize,
  type ViewWorld,
} from "./kit";

/** The lens: pink and blue dot screens at 15 and 75 degrees, `mis` apart. */
const HALFTONE = {
  vertex: /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
  fragment: /* glsl */ `
uniform vec3 sheet;
uniform vec3 pink;
uniform vec3 blue;
uniform vec3 yellow;
uniform vec3 weights;
uniform float mis;
varying vec2 vUv;

float screen(vec2 p, float angle, float size) {
  float c = cos(angle);
  float s = sin(angle);
  vec2 q = mat2(c, -s, s, c) * p * 9.0;
  vec2 cell = fract(q) - 0.5;
  float d = length(cell);
  return 1.0 - smoothstep(size - 0.06, size + 0.06, d);
}

void main() {
  vec2 p = vUv - 0.5;
  vec3 col = sheet;
  float a = screen(p + vec2(mis * 0.012, 0.0), 0.2618, 0.3);
  float b = screen(p - vec2(mis * 0.012, 0.0), 1.309, 0.3);
  float y = screen(p, 0.0, 0.34);
  col = mix(col, col * pink, a * weights.x);
  col = mix(col, col * blue, b * weights.y);
  col = mix(col, col * yellow, y * weights.z);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`,
};

/** Which screens a separations row shows under the lens: P1, P2, both, P3. */
const SCREENS: Record<string, readonly [number, number, number]> = {
  p1: [1, 0, 0],
  p2: [0, 1, 0],
  both: [1, 1, 0],
  p3: [0, 0, 1],
};
const FIT = { width: 1.55, height: 0, from: [0, 0.12, 1], fov: 20 } as const;
/** Where the loupe rests: over the "in register" row. */
const REST = "both";

function createLoupe() {
  const root = new Group();
  const m = inks();
  const tones = {
    sheet: new Color(),
    pink: new Color(),
    blue: new Color(),
    yellow: new Color(),
  };
  const lensMat = new ShaderMaterial({
    vertexShader: HALFTONE.vertex,
    fragmentShader: HALFTONE.fragment,
    uniforms: {
      sheet: { value: tones.sheet },
      pink: { value: tones.pink },
      blue: { value: tones.blue },
      yellow: { value: tones.yellow },
      weights: { value: [1, 1, 0] },
      mis: { value: 1 },
    },
  });
  const lens = new Mesh(new CircleGeometry(0.5, 40), lensMat);
  const ring = new Mesh(new TorusGeometry(0.52, 0.055, 10, 48), m.ink);
  // The folding stand: a leg down to the sheet behind the lens.
  const leg = new Mesh(new BoxGeometry(0.08, 0.7, 0.04), m.ink);
  leg.position.set(0.44, -0.46, -0.08);
  leg.rotation.z = 0.5;
  const head = new Group();
  head.add(lens, ring, leg);
  root.add(head);
  const colours = () => {
    tones.sheet.copy(inkColour("sheet"));
    tones.pink.copy(inkColour("pink"));
    tones.blue.copy(inkColour("blue"));
    tones.yellow.copy(inkColour("yellow"));
  };
  return { root, head, lensMat, colours };
}

/**
 * A linen tester: parked over one row, it slides to the row you point at
 * (`rows` says where each row's centre sits, as a fraction of the
 * placeholder's height) and shows that plate's dot screen alone; "P1 + P2"
 * shows the rosette. With `follow` it follows the pointer down the
 * placeholder instead, parked at the top when the pointer is away.
 */
function createLoupeView(
  el: HTMLElement | null,
  rows: (el: HTMLElement) => { key: string; at: number }[],
  follow: boolean
): ViewWorld {
  const w = createLoupe();
  w.colours();
  const offTheme = onTheme(w.colours);
  const pointer = trackPointer(el, 1);
  const d = createDamp({ y: 0, p1: 1, p2: 1, p3: 0, mis: 1 });
  let placed = false;
  return {
    root: w.root,
    frame(delta) {
      if (!el) return;
      const span = visibleSize(el, FIT).height;
      const found = rows(el);
      const near = follow && pointer.p.inside;
      const key =
        hoveredKey(sceneStore.getState().hovered, ITEM.plate) ??
        (near ? "both" : REST);
      const row =
        found.find((it) => it.key === key) ??
        found.find((it) => it.key === REST);
      let at = row?.at ?? 0.5;
      if (follow) at = near ? (1 - pointer.p.y) / 2 : 0.1;
      const y = (0.5 - at) * span;
      const screens = SCREENS[row?.key ?? key] ?? [1, 1, 0];
      if (!placed) {
        d.v.y = y;
        placed = true;
      }
      d.to("y", y, 0.16, delta);
      d.to("p1", screens[0], 0.2, delta);
      d.to("p2", screens[1], 0.2, delta);
      d.to("p3", screens[2], 0.2, delta);
      d.to("mis", key === "both" ? 0 : 1, 0.12, delta);
      w.head.position.y = d.v.y;
      const u = w.lensMat.uniforms;
      if (u.weights) u.weights.value = [d.v.p1, d.v.p2, d.v.p3];
      if (u.mis) u.mis.value = d.v.mis;
      d.end();
    },
    dispose() {
      offTheme();
      pointer.dispose();
    },
  };
}

const separationRows = (el: HTMLElement) => {
  const box = el.getBoundingClientRect();
  return [
    ...document.querySelectorAll<HTMLElement>(
      `[data-scene-item^="${ITEM.plate}:"]`
    ),
  ].map((row) => {
    const r = row.getBoundingClientRect();
    return {
      key: row.dataset.sceneItem?.slice(ITEM.plate.length + 1) ?? "",
      at: (r.top + r.height / 2 - box.top) / Math.max(1, box.height),
    };
  });
};

/** Home: the loupe over the separations list. */
export const HomeLoupe = () => (
  <PressView
    id={VIEW.loupe}
    fit={FIT}
    create={(el) => createLoupeView(el, separationRows, false)}
  />
);

/** A query's page: the loupe in the margin, following the pointer down the thread. */
export const ThreadLoupe = () => (
  <PressView
    id={VIEW.threadLoupe}
    fit={FIT}
    create={(el) => createLoupeView(el, () => [], true)}
  />
);
