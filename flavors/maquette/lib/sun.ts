/**
 * The shadow study: where the sun stands over Mathura on the study date,
 * minute by minute. NOAA's low-precision solar position, good to a few
 * tenths of a degree, which is finer than any shadow on a card model.
 * No DOM and no three.js, so the poster, the plan drawings and the scene
 * read the same sun.
 */

const RAD = Math.PI / 180;

/** Mathura, 27.49° N 77.67° E, on Indian Standard Time (UTC+05:30). */
export const SITE = { lat: 27.49, lon: 77.67, utcOffset: 330 } as const;

/** The study date: 26 September 2026, day 269 of the year. */
export const STUDY = { label: "26 September 2026", dayOfYear: 269 } as const;

/** The slider's range and step, minutes after midnight IST: 07:00 to 17:30. */
export const DAY_START = 7 * 60;
export const DAY_END = 17 * 60 + 30;
export const STEP = 5;

/** Where the study rests before anyone moves the sun: 15:10, a long raking light from the west. */
export const DEFAULT_MINUTES = 15 * 60 + 10;

/** The night lamp: one spotlight held at this elevation, swung by the same slider. */
export const LAMP_ELEVATION = 50;

export type Sun = {
  /** Degrees above the horizon (negative below it). */
  elevation: number;
  /** Degrees clockwise from north. */
  azimuth: number;
};

/** The sun at `minutes` after midnight local time on the study date. */
export function solar(
  minutes: number,
  dayOfYear: number = STUDY.dayOfYear,
  site: { lat: number; lon: number; utcOffset: number } = SITE
): Sun {
  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (minutes / 60 - 12) / 24);
  const eot =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));
  const dec =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const lat = site.lat * RAD;
  const ha = ((minutes + eot + 4 * site.lon - site.utcOffset) / 4 - 180) * RAD;
  const el = Math.asin(
    Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha)
  );
  const az =
    Math.atan2(
      Math.sin(ha),
      Math.cos(ha) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)
    ) + Math.PI;
  return { elevation: el / RAD, azimuth: az / RAD };
}

/** The light the model is under: the sun by day, the lamp at a fixed height by night. */
export function lightAt(minutes: number, night: boolean): Sun {
  const sun = solar(minutes);
  return night ? { elevation: LAMP_ELEVATION, azimuth: sun.azimuth } : sun;
}

const POINTS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

/** The 16-point compass name for a bearing: 244 reads WSW. */
export const compassPoint = (bearing: number) =>
  POINTS[Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16] ?? "N";

/** `15:10` for 910 minutes. */
export const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** The reading under the study, and the slider's spoken value. */
export function describeLight(minutes: number, night: boolean) {
  const { elevation, azimuth } = lightAt(minutes, night);
  const bearing = Math.round(azimuth);
  const point = compassPoint(bearing);
  if (night) {
    return {
      reading: `One spotlight at ${LAMP_ELEVATION}°, from ${bearing}° ${point}. The slider swings the lamp.`,
      valueText: `Spotlight from ${bearing} degrees ${point}`,
    };
  }
  const high = Math.round(elevation);
  return {
    reading: `Mathura, ${STUDY.label}, ${clock(minutes)} IST. Sun ${high}° high, from ${bearing}° ${point}.`,
    valueText: `${clock(minutes)}, sun ${high} degrees high from ${point}`,
  };
}

/** Unit vector toward the light in the model's frame: x east, y up, z south. */
export function lightVector({ elevation, azimuth }: Sun) {
  const e = elevation * RAD;
  const a = azimuth * RAD;
  return {
    x: Math.sin(a) * Math.cos(e),
    y: Math.sin(e),
    z: -Math.cos(a) * Math.cos(e),
  };
}

type Point = readonly [number, number];

const cross = (o: Point, a: Point, b: Point) =>
  (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** Convex hull, counter-clockwise (Andrew's monotone chain). */
export function hull(points: readonly Point[]): Point[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const lower: Point[] = [];
  for (const q of p) {
    while (
      lower.length > 1 &&
      cross(lower.at(-2) ?? q, lower.at(-1) ?? q, q) <= 0
    )
      lower.pop();
    lower.push(q);
  }
  const upper: Point[] = [];
  for (const q of p.reverse()) {
    while (
      upper.length > 1 &&
      cross(upper.at(-2) ?? q, upper.at(-1) ?? q, q) <= 0
    )
      upper.pop();
    upper.push(q);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

export type PlanRect = { x: number; y: number; w: number; h: number };

/** Shadows never run further than this multiple of the block's height, so a low sun stays on the card. */
const MAX_SHADOW = 7;

/**
 * The shadow a box casts on the site in plan (north up, y down): the hull of
 * its footprint and the footprint pushed away from the light by
 * height / tan(elevation). Returns an SVG `points` string.
 */
export function planShadow(rect: PlanRect, height: number, light: Sun) {
  const e = Math.max(light.elevation, 4) * RAD;
  const a = light.azimuth * RAD;
  const length = Math.min(height / Math.tan(e), height * MAX_SHADOW);
  const dx = -Math.sin(a) * length;
  const dy = Math.cos(a) * length;
  const { x, y, w, h } = rect;
  const base: Point[] = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  const cast = base.map(([px, py]): Point => [px + dx, py + dy]);
  return hull([...base, ...cast])
    .map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`)
    .join(" ");
}

/** The sun-path arc for the study's little chart, in a 300 by 44 box. */
export function sunPath(width = 300, horizon = 40, scale = 0.58) {
  const px = (m: number) => ((m - DAY_START) / (DAY_END - DAY_START)) * width;
  const py = (elevation: number) => horizon - elevation * scale;
  let d = "";
  for (let m = DAY_START; m <= DAY_END; m += 10) {
    const { elevation } = solar(m);
    d += `${d ? "L" : "M"}${px(m).toFixed(1)} ${py(elevation).toFixed(1)}`;
  }
  return { d, px, py };
}
