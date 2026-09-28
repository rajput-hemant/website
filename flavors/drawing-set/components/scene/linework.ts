import type { RGB } from "@/flavors/drawing-set/lib/scene/accent";
import {
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  Vector3,
} from "three";

/**
 * One piece of a drawing: a solid whose feature edges become lines and whose
 * faces become a ground-coloured fill (hiding back lines), or raw segments.
 */
export type Part = {
  geo?: BufferGeometry;
  segments?: number[];
  faint?: boolean;
  /** EdgesGeometry threshold in degrees. */
  threshold?: number;
};

export const uniforms = {
  uInk: { value: new Color() },
  uAccent: { value: new Color() },
  uGround: { value: new Color() },
};

export function setPalette(p: { ground: RGB; ink: RGB; accent: RGB }) {
  uniforms.uGround.value.setRGB(...p.ground);
  uniforms.uInk.value.setRGB(...p.ink);
  uniforms.uAccent.value.setRGB(...p.accent);
}

const vertexShader = /* glsl */ `
attribute mat4 aInstance;
attribute float aHot;
attribute float aFaint;
varying float vHot;
varying float vFaint;
void main() {
  vHot = aHot;
  vFaint = aFaint;
  gl_Position = projectionMatrix * modelViewMatrix * aInstance * vec4(position, 1.0);
}`;

const lineFragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uAccent;
uniform vec3 uGround;
varying float vHot;
varying float vFaint;
void main() {
  vec3 ink = mix(uInk, uGround, vFaint * 0.55);
  gl_FragColor = vec4(mix(ink, uAccent, vHot), 1.0);
  #include <colorspace_fragment>
}`;

const fillVertex = /* glsl */ `
attribute mat4 aInstance;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * aInstance * vec4(position, 1.0);
}`;

const fillFragment = /* glsl */ `
uniform vec3 uGround;
void main() {
  gl_FragColor = vec4(uGround, 1.0);
  #include <colorspace_fragment>
}`;

const lineMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader: lineFragment,
});

const fillMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: fillVertex,
  fragmentShader: fillFragment,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});

const proxyMaterial = new MeshBasicMaterial({ visible: false });

/**
 * `count` instances of the same drawing in two draw calls (lines + fill),
 * sharing one line and one fill material across the whole scene. Instance
 * matrices are in world space. `presence` plots the lines in like a pen.
 */
export class Linework {
  readonly group = new Group();
  readonly proxy: InstancedMesh | null = null;
  readonly matrices: Float32Array;
  private readonly hot: Float32Array;
  private readonly lineGeo = new InstancedBufferGeometry();
  private readonly fillGeo: InstancedBufferGeometry | null = null;
  private readonly aInstance: InstancedBufferAttribute;
  private readonly aHot: InstancedBufferAttribute;
  private readonly vertices: number;
  count: number;

  constructor(
    parts: Part[],
    readonly max = 1,
    interactive = false
  ) {
    const lines: number[] = [];
    const faint: number[] = [];
    const fill: number[] = [];
    for (const part of parts) {
      let segs = part.segments ?? [];
      if (part.geo) {
        const edges = new EdgesGeometry(part.geo, part.threshold ?? 1);
        segs = segs.concat(Array.from(edges.attributes.position!.array));
        edges.dispose();
        const faces = part.geo.index ? part.geo.toNonIndexed() : part.geo;
        fill.push(...(faces.attributes.position!.array as Float32Array));
        faces.dispose();
        part.geo.dispose();
      }
      lines.push(...segs);
      for (let i = 0; i < segs.length / 3; i++) faint.push(part.faint ? 1 : 0);
    }

    this.count = max;
    this.vertices = lines.length / 3;
    this.matrices = new Float32Array(16 * max);
    this.hot = new Float32Array(max);
    const identity = new Matrix4();
    for (let i = 0; i < max; i++) identity.toArray(this.matrices, i * 16);
    this.aInstance = new InstancedBufferAttribute(this.matrices, 16);
    this.aHot = new InstancedBufferAttribute(this.hot, 1);

    this.lineGeo.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(lines), 3)
    );
    this.lineGeo.setAttribute(
      "aFaint",
      new BufferAttribute(new Float32Array(faint), 1)
    );
    this.lineGeo.setAttribute("aInstance", this.aInstance);
    this.lineGeo.setAttribute("aHot", this.aHot);
    this.lineGeo.instanceCount = max;
    this.group.add(new LineSegments(this.lineGeo, lineMaterial));

    if (fill.length) {
      this.fillGeo = new InstancedBufferGeometry();
      this.fillGeo.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(fill), 3)
      );
      this.fillGeo.setAttribute("aInstance", this.aInstance);
      this.fillGeo.instanceCount = max;
      this.group.add(new Mesh(this.fillGeo, fillMaterial));

      if (interactive) {
        const box = new Box3().setFromBufferAttribute(
          this.fillGeo.attributes.position as BufferAttribute
        );
        const size = box.getSize(new Vector3());
        const centre = box.getCenter(new Vector3());
        const geo = new BoxGeometry(size.x, size.y, Math.max(size.z, 0.02));
        geo.translate(centre.x, centre.y, centre.z);
        this.proxy = new InstancedMesh(geo, proxyMaterial, max);
        this.proxy.instanceMatrix = this.aInstance;
      }
    }

    for (const child of this.group.children) {
      child.frustumCulled = false;
      child.raycast = () => {};
    }
  }

  setMatrix(i: number, m: Matrix4) {
    m.toArray(this.matrices, i * 16);
  }

  setHot(i: number, value: number) {
    this.hot[i] = value;
  }

  setCount(n: number) {
    this.count = Math.min(n, this.max);
  }

  /** Uploads matrices and hot values; `presence` 0..1 plots the lines. */
  commit(presence: number) {
    const visible = presence > 0.001;
    this.group.visible = visible;
    if (this.proxy) this.proxy.count = presence > 0.5 ? this.count : 0;
    if (!visible) return;
    this.lineGeo.instanceCount = this.count;
    if (this.fillGeo) this.fillGeo.instanceCount = this.count;
    this.lineGeo.setDrawRange(
      0,
      Math.floor((presence * this.vertices) / 2) * 2
    );
    this.aInstance.needsUpdate = true;
    this.aHot.needsUpdate = true;
    if (this.proxy) this.proxy.boundingSphere = null;
  }
}

/** A box part, translated. */
export function box(
  w: number,
  h: number,
  d: number,
  x = 0,
  y = 0,
  z = 0,
  faint = false
): Part {
  return { geo: new BoxGeometry(w, h, d).translate(x, y, z), faint };
}

/** A polyline as raw segments; `closed` joins the ends. */
export function polyline(
  points: number[][],
  closed = false,
  faint = false
): Part {
  const segments: number[] = [];
  const last = closed ? points.length : points.length - 1;
  for (let i = 0; i < last; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    segments.push(a[0]!, a[1]!, a[2] ?? 0, b[0]!, b[1]!, b[2] ?? 0);
  }
  return { segments, faint };
}
