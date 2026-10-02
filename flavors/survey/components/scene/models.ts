import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LatheGeometry,
  PlaneGeometry,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * The props' models, shared by the relief's props layer and the blit glyphs
 * (one geometry, two uses).
 */

type Model = "pillar" | "antiquity" | "works" | "stone" | "stake" | "tape";
export type Solid =
  Model | "tent" | "buoy" | "light" | "beam" | "theodolite" | "scope";

/** Unlit models in sheet units, standing on y = 0 (y is scaled by the tilt in the shader). */
export function model(kind: Solid): BufferGeometry {
  switch (kind) {
    case "pillar":
      return new CylinderGeometry(1.6, 2.8, 9, 4, 1)
        .rotateY(Math.PI / 4)
        .translate(0, 4.5, 0);
    case "antiquity":
      return merge([
        new BoxGeometry(1.2, 10, 1.2).translate(0, 5, 0),
        new BoxGeometry(6, 1.2, 1.2).translate(0, 6.5, 0),
      ]);
    case "works":
      return new BoxGeometry(6, 6, 6).translate(0, 3, 0);
    case "stone":
      return new IcosahedronGeometry(1.4, 0).translate(0, 1.1, 0);
    case "stake":
      return new BoxGeometry(0.8, 10, 0.8).translate(0, 5, 0);
    case "tape":
      return new PlaneGeometry(4.5, 1.8, 4, 1).translate(2.25, 0, 0);
    case "tent":
      return tent();
    case "buoy":
      return new LatheGeometry(
        [
          [0, 0],
          [2.6, 0.4],
          [3, 1.8],
          [2.2, 3.2],
          [0.6, 3.8],
          [0.4, 8],
          [0, 8.2],
        ].map(([x = 0, y = 0]) => new Vector2(x, y)),
        10
      );
    case "light":
      return merge([
        new CylinderGeometry(1.6, 2.6, 16, 8, 1).translate(0, 8, 0),
        new BoxGeometry(3.4, 2.4, 3.4).translate(0, 17.2, 0),
      ]);
    case "theodolite":
      return theodolite().stand;
    case "scope": {
      const { alidade, telescope, trunnion } = theodolite();
      return merge([alidade, telescope.translate(0, trunnion, 0)]);
    }
    case "beam":
      // Apex at the lamp, opening east; the instance yaw turns it.
      return new ConeGeometry(14, 90, 16, 1, true)
        .translate(0, -45, 0)
        .rotateZ(Math.PI / 2);
  }
}

function merge(parts: BufferGeometry[]) {
  const merged = mergeGeometries(parts) ?? new BufferGeometry();
  for (const part of parts) part.dispose();
  return merged;
}

/** A ridge tent: a triangular prism along x. */
function tent() {
  const g = new BufferGeometry();
  g.setAttribute(
    "position",
    new Float32BufferAttribute(
      [
        -4.5, 0, -3.5, -4.5, 5.5, 0, -4.5, 0, 3.5, 4.5, 0, -3.5, 4.5, 5.5, 0,
        4.5, 0, 3.5,
      ],
      3
    )
  );
  g.setIndex([0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2]);
  return g;
}

/** Where the telescope's trunnion axis stands above the ground. */
const TRUNNION = 10.1;

/**
 * The theodolite (H2 on the home sheet, A2 in the about page's instrument
 * glyph), in three parts so each use can turn what it needs: the `stand`
 * (tripod, head and levelling base) stays put, the `alidade` (plate and
 * standards) turns about the upright, and the `telescope`, built at the
 * origin pointing east (+x), nods about its trunnion (z) at `trunnion`.
 */
export function theodolite() {
  const legs = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const foot = new Vector3(Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4);
    const head = new Vector3(Math.cos(a) * 0.7, 7.4, Math.sin(a) * 0.7);
    const along = head.clone().sub(foot);
    return new CylinderGeometry(0.16, 0.26, along.length(), 4, 1)
      .applyQuaternion(
        new Quaternion().setFromUnitVectors(
          new Vector3(0, 1, 0),
          along.clone().normalize()
        )
      )
      .translate(
        (foot.x + head.x) / 2,
        (foot.y + head.y) / 2,
        (foot.z + head.z) / 2
      );
  });
  const stand = merge([
    ...legs,
    new CylinderGeometry(1.5, 1.5, 0.4, 8, 1).translate(0, 7.6, 0),
    new CylinderGeometry(1.0, 1.25, 0.8, 8, 1).translate(0, 8.2, 0),
  ]);
  const alidade = merge([
    new CylinderGeometry(1.15, 1.15, 0.3, 10, 1).translate(0, 8.75, 0),
    new BoxGeometry(0.7, 1.9, 0.3).translate(0, 9.8, 0.85),
    new BoxGeometry(0.7, 1.9, 0.3).translate(0, 9.8, -0.85),
  ]);
  const telescope = merge([
    new CylinderGeometry(0.46, 0.34, 3.4, 10, 1)
      .rotateZ(-Math.PI / 2)
      .translate(0.3, 0, 0),
    new CylinderGeometry(0.2, 0.2, 1.4, 6, 1).rotateX(Math.PI / 2),
  ]);
  return { stand, alidade, telescope, trunnion: TRUNNION };
}
