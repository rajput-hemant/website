import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Material,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const TAU = Math.PI * 2;

const standard = (color: string, extra = {}) =>
  new MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.2,
    ...extra,
  });

/**
 * A Hilfiker-style station clock face, facing +z: rim, enamel dial, hour
 * bars (and minute ticks), hour and minute hands, and optionally the
 * seconds hand with its disc. Shared by the /now clock beside the indicator
 * and the home clock view. `set` places the hands for a time; they jump,
 * like the real clock's minute hand.
 */
export function createClockFace(
  r: number,
  { seconds = false, minuteTicks = false } = {}
) {
  const ink = standard("#14191e");
  const rimMaterial = standard("#1b2025", { metalness: 0.5 });
  const group = new Group();
  const disc = (radius: number, depth: number, material: Material) => {
    const mesh = new Mesh(
      new CylinderGeometry(radius, radius, depth, 48),
      material
    );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  const rim = disc(r + 0.05, 0.08, rimMaterial);
  // Unlit, so the dial reads enamel white under the sign's lights.
  const face = disc(r, 0.09, new MeshBasicMaterial({ color: "#f4f6f7" }));
  const count = minuteTicks ? 60 : 12;
  const bars = new InstancedMesh(new BoxGeometry(0.04, 0.13, 0.01), ink, count);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    const hour = !minuteTicks || i % 5 === 0;
    const m = new Matrix4()
      .makeRotationZ(-a)
      .setPosition(
        Math.sin(a) * r * (hour ? 0.82 : 0.86),
        Math.cos(a) * r * (hour ? 0.82 : 0.86),
        0.05
      );
    if (!hour) m.multiply(new Matrix4().makeScale(0.4, 0.35, 1));
    bars.setMatrixAt(i, m);
  }
  const hand = (width: number, length: number) => {
    const geometry = new BoxGeometry(width, length, 0.012);
    geometry.translate(0, length / 2 - 0.06, 0);
    const mesh = new Mesh(geometry, ink);
    mesh.position.z = 0.06;
    return mesh;
  };
  const hour = hand(0.06, r * 0.62);
  const minute = hand(0.045, r * 0.9);
  minute.position.z = 0.065;
  group.add(rim, face, bars, hour, minute);

  let second: Mesh | null = null;
  const signal = standard("#ffc20e", { roughness: 0.4 });
  if (seconds) {
    // Stem and disc in one geometry: one draw call for the whole hand.
    const stem = new BoxGeometry(0.018, r * 0.78, 0.01);
    stem.translate(0, (r * 0.78) / 2 - 0.12, 0);
    const bob = new CylinderGeometry(r * 0.12, r * 0.12, 0.01, 24);
    bob.rotateX(Math.PI / 2);
    bob.translate(0, r * 0.56, 0);
    const merged = mergeGeometries([stem, bob]);
    second = new Mesh(merged ?? stem, signal);
    second.position.z = 0.072;
    group.add(second);
  }

  return {
    group,
    ink,
    rim: rimMaterial,
    signal,
    second,
    /** Hands for `now`; the minute hand sits on the whole minute. */
    set(now: Date) {
      const m = now.getMinutes();
      minute.rotation.z = -(m / 60) * TAU;
      hour.rotation.z = -(((now.getHours() % 12) + m / 60) / 12) * TAU;
    },
  };
}
