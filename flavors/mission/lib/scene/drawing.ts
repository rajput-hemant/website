import {
  craftAngle,
  litAt,
  occluded,
  orbitPoint,
  rigAngles,
  SITE,
  sph,
  view,
  type Board,
  type Pose,
  type V3,
} from "./poses";

/**
 * The globe as a hidden-line drawing, in globe radii with y up: the same
 * projection the scene renders, so the SVG poster and the canvas agree line
 * for line. Pure, for the poster and the tests.
 */

const D = Math.PI / 180;
const N = 64;
const ORBIT = 96;
const r3 = (n: number) => Math.round(n * 1000) / 1000;
/** A viewed point on the page: SVG y runs down. */
const flat = (p: V3): [number, number] => [r3(p[0]), r3(-p[1])];

/** Joins visible points into one path, lifting the pen where a point hides. */
function trace(points: V3[], hidden: (p: V3) => boolean) {
  let d = "";
  let pen = false;
  for (const p of points) {
    if (hidden(p)) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${r3(p[0])} ${r3(-p[1])}`;
    pen = true;
  }
  return d;
}

export type GlobeDrawing = {
  /** The 15 degree graticule, front face only. */
  graticule: string;
  orbits: { d: string; lit: boolean; craft: [number, number] | null }[];
  /** The launch site, or null when it is round the back. */
  site: [number, number] | null;
};

export function drawGlobe(
  board: Board,
  pose: Pose,
  t = board.now
): GlobeDrawing {
  const { yaw, pitch } = rigAngles(pose);
  const seen = (p: V3) => view(p, yaw, pitch);
  const back = (p: V3) => p[2] < 0;

  let graticule = "";
  for (let lat = -75; lat <= 75; lat += 15) {
    const ring: V3[] = [];
    for (let i = 0; i <= N; i++)
      ring.push(seen(sph(lat * D, (i / N) * 2 * Math.PI)));
    graticule += trace(ring, back);
  }
  for (let lon = 0; lon < 360; lon += 15) {
    const meridian: V3[] = [];
    for (let i = 0; i <= N / 2; i++) {
      meridian.push(seen(sph((i / (N / 2) - 0.5) * Math.PI, lon * D)));
    }
    graticule += trace(meridian, back);
  }

  const orbits = board.orbits.map((orbit, i) => {
    const ring: V3[] = [];
    for (let k = 0; k <= ORBIT; k++) {
      ring.push(seen(orbitPoint(orbit, i, (k / ORBIT) * 2 * Math.PI)));
    }
    const lit = litAt(pose, orbit, t);
    const c = lit ? seen(orbitPoint(orbit, i, craftAngle(orbit, t))) : null;
    return {
      d: trace(ring, occluded),
      lit,
      craft: c && !occluded(c) ? flat(c) : null,
    };
  });

  const s = seen(sph(SITE.lat * D, SITE.lon * D));
  return {
    graticule,
    orbits,
    site: s[2] > 0 ? flat(s) : null,
  };
}
