import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LatheGeometry,
  PlaneGeometry,
  Vector2,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * The props' models, shared by the relief's props layer and the blit glyphs
 * (one geometry, two uses).
 */

type Model = "pillar" | "antiquity" | "works" | "stone" | "stake" | "tape";
export type Solid = Model | "tent" | "buoy" | "light" | "beam";

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
