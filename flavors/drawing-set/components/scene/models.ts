import { CHEST, DH, TABLE } from "@/flavors/drawing-set/lib/scene/poses";
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  OctahedronGeometry,
  Quaternion,
  TorusGeometry,
  Vector3,
} from "three";

import { box, polyline, type Part } from "./linework";

const { W, H, D } = CHEST;
const FLOOR = -H / 2 - 0.45;

/** World matrix of the drafting board surface (local y = 0 is its centre plane). */
export const board = new Matrix4().compose(
  new Vector3(TABLE.x, TABLE.y, TABLE.z),
  new Quaternion().setFromEuler(new Euler(TABLE.tilt, 0, 0)),
  new Vector3(1, 1, 1)
);

export function chestBody(): Part[] {
  const corners: [number, number][] = [
    [-W / 2 + 0.12, D / 2 - 0.12],
    [W / 2 - 0.12, D / 2 - 0.12],
    [-W / 2 + 0.12, -D / 2 + 0.12],
    [W / 2 - 0.12, -D / 2 + 0.12],
  ];
  const legs = corners.map(([x, z]) =>
    box(0.08, 0.45, 0.08, x, -H / 2 - 0.22, z)
  );
  return [
    box(W + 0.08, 0.08, D + 0.08, 0, H / 2 + 0.04),
    box(W, H, 0.04, 0, 0, -D / 2),
    box(0.04, H, D, -W / 2),
    box(0.04, H, D, W / 2),
    box(W, 0.12, D, 0, -H / 2 + 0.06),
    ...legs,
  ];
}

/** One drawer, centred on its own height; z = 0 is closed. */
export function drawer(): Part[] {
  return [
    box(W - 0.1, DH - 0.05, 0.06, 0, 0, D / 2 - 0.03),
    box(W - 0.16, DH * 0.55, D - 0.1, 0, -DH * 0.15, 0, true),
    box(0.4, 0.09, 0.02, 0, 0.05, D / 2 + 0.01),
    box(0.7, 0.035, 0.05, 0, -0.08, D / 2 + 0.03),
  ];
}

export function table(): Part[] {
  const onBoard = (part: Part) => {
    part.geo?.applyMatrix4(board);
    return part;
  };
  const corners: [number, number][] = [
    [-1.4, -0.85],
    [1.4, -0.85],
    [-1.4, 0.85],
    [1.4, 0.85],
  ];
  const legs = corners.map(([x, z]) => {
    const top = TABLE.y - z * Math.sin(TABLE.tilt) - 0.03;
    return box(0.08, top - FLOOR, 0.08, TABLE.x + x, (top + FLOOR) / 2, z);
  });
  return [
    onBoard(box(3.2, 0.06, 2.2)),
    onBoard(box(3.3, 0.03, 0.08, 0, 0.045, 0.35)),
    ...legs,
    box(2.8, 0.06, 0.06, TABLE.x, -1.25, -0.85),
    box(2.8, 0.06, 0.06, TABLE.x, -1.25, 0.85),
  ];
}

/** A landscape drawing sheet standing on its bottom edge: border and title block. */
export function sheet(): Part[] {
  return [
    box(1.1, 0.78, 0.004, 0, 0.39),
    box(1.0, 0.68, 0.006, 0, 0.39),
    box(0.32, 0.12, 0.008, 0.34, 0.11),
  ];
}

/** A portrait A4 sheet centred on the origin, with ruled text lines. */
export function a4(): Part[] {
  const rows: Part[] = [];
  for (let i = 0; i < 14; i++) {
    const y = 0.44 - i * 0.06;
    const len = i % 5 === 0 ? 0.3 : 0.62 - ((i * 7) % 5) * 0.06;
    rows.push(
      polyline(
        [
          [-0.34, y, 0.004],
          [-0.34 + len, y, 0.004],
        ],
        false,
        true
      )
    );
  }
  return [
    box(0.84, 1.188, 0.004),
    box(0.76, 1.1, 0.006),
    box(0.3, 0.1, 0.008, 0.21, -0.48),
    ...rows,
  ];
}

/** A unit-length dimension segment along y with end ticks; scale y per role. */
export function segment(): Part[] {
  return [
    box(0.1, 1, 0.1),
    box(0.44, 0.004, 0.004, 0, 0.5),
    box(0.44, 0.004, 0.004, 0, -0.5),
  ];
}

/** A schedule card standing on its bottom edge, with a header rule and mark column. */
export function card(): Part[] {
  return [
    box(1.7, 1.05, 0.012, 0, 0.525),
    polyline(
      [
        [-0.8, 0.88, 0.007],
        [0.8, 0.88, 0.007],
      ],
      false,
      true
    ),
    polyline(
      [
        [-0.5, 0.1, 0.007],
        [-0.5, 0.88, 0.007],
      ],
      false,
      true
    ),
  ];
}

export function catalogueCard(): Part[] {
  return [box(0.9, 0.6, 0.008, 0, 0.3), box(0.26, 0.08, 0.008, -0.22, 0.64)];
}

/** A revision cloud: a scalloped rectangle in the xy plane, centred. */
export function cloud(w: number, h: number, r = 0.12): Part[] {
  const corners = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ] as const;
  const points: number[][] = [];
  for (let s = 0; s < 4; s++) {
    const [ax, ay] = corners[s]!;
    const [bx, by] = corners[(s + 1) % 4]!;
    const len = Math.hypot(bx - ax, by - ay);
    const k = Math.max(1, Math.round(len / (2 * r)));
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    const rad = len / k / 2;
    for (let i = 0; i < k; i++) {
      const cx = ax + ux * rad * (2 * i + 1);
      const cy = ay + uy * rad * (2 * i + 1);
      for (let j = 0; j < 8; j++) {
        const t = (Math.PI * j) / 8;
        points.push([
          cx - ux * rad * Math.cos(t) + uy * rad * Math.sin(t),
          cy - uy * rad * Math.cos(t) - ux * rad * Math.sin(t),
          0,
        ]);
      }
    }
  }
  return [polyline(points, true)];
}

/** The revision triangle, pointing up in the xy plane, with a leader to the cloud. */
export function triangle(): Part[] {
  return [
    { geo: new CylinderGeometry(0.2, 0.2, 0.04, 3).rotateX(-Math.PI / 2) },
    polyline([
      [-0.1, -0.12, 0],
      [-0.18, -0.28, 0],
    ]),
  ];
}

export function tray(): Part[] {
  return [
    box(1.7, 0.03, 1.2),
    box(1.7, 0.09, 0.03, 0, 0.045, 0.585),
    box(1.7, 0.09, 0.03, 0, 0.045, -0.585),
    box(0.03, 0.09, 1.2, 0.835, 0.045),
    box(0.03, 0.09, 1.2, -0.835, 0.045),
  ];
}

export function slip(): Part[] {
  return [
    box(1.35, 0.004, 0.9),
    polyline(
      [
        [-0.6, 0.003, -0.28],
        [0.6, 0.003, -0.28],
      ],
      false,
      true
    ),
  ];
}

export function turntable(): Part[] {
  return [
    { geo: new CylinderGeometry(1.15, 1.15, 0.05, 48), threshold: 30 },
    {
      geo: new CylinderGeometry(0.5, 0.6, 0.12, 24).translate(0, -0.085, 0),
      threshold: 30,
    },
    polyline([
      [0, 0.026, 0],
      [0, 0.026, 1.1],
    ]),
  ];
}

/** Study objects for the lab turntable, each resting on y = 0. */
export function studies(): Part[][] {
  return [
    [{ geo: new IcosahedronGeometry(0.26).translate(0, 0.26, 0) }],
    [{ geo: new OctahedronGeometry(0.28).translate(0, 0.28, 0) }],
    [{ geo: new BoxGeometry(0.36, 0.36, 0.36).translate(0, 0.18, 0) }],
    [{ geo: new ConeGeometry(0.24, 0.5, 6).translate(0, 0.25, 0) }],
    [{ geo: new DodecahedronGeometry(0.26).translate(0, 0.26, 0) }],
    [
      {
        geo: new TorusGeometry(0.2, 0.07, 8, 20).translate(0, 0.27, 0),
        threshold: 30,
      },
    ],
  ];
}
