/**
 * Where each jewel's name tag goes: beside its jewel, towards the side it
 * prefers, but never over another tag or out of the round window. No DOM
 * here, so it is tested on its own; `layTags` applies it to the page.
 */
export type TagAnchor = {
  /** The jewel's centre in the window, px. */
  x: number;
  y: number;
  /** The tag's size, px. */
  w: number;
  h: number;
  prefer: "left" | "right";
};

export type TagPlace = { left: boolean; dy: number };

/** The gap between a jewel's centre and its tag. */
export const TAG_GAP = 10;

type Rect = { x0: number; y0: number; x1: number; y1: number };

const rectOf = (a: TagAnchor, left: boolean, dy: number): Rect => {
  const x0 = left ? a.x - TAG_GAP - a.w : a.x + TAG_GAP;
  const y0 = a.y + dy - a.h / 2;
  return { x0, y0, x1: x0 + a.w, y1: y0 + a.h };
};

/** How much two rects cover each other, with a hairline of clearance. */
const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x1, b.x1) + 2 - Math.max(a.x0, b.x0)) *
  Math.max(0, Math.min(a.y1, b.y1) + 1 - Math.max(a.y0, b.y0));

/** Steps up and down from the jewel, nearest first. */
const STEPS = [0, -1, 1, -2, 2, -3, 3, -4, 4];

/**
 * Places tags top to bottom: each tries its preferred side, then the other,
 * then steps up or down a tag's height at a time, and takes the first spot
 * that is clear and inside the window (a circle filling `width` by
 * `height`). With no clear spot it takes the one inside the window that
 * covers the others least.
 */
export function placeTags(
  anchors: readonly TagAnchor[],
  width: number,
  height: number
): TagPlace[] {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 2;
  const inside = (q: Rect) =>
    [q.x0, q.x1].every((x) =>
      [q.y0, q.y1].every((y) => Math.hypot(x - cx, y - cy) <= r)
    );
  const order = anchors.map((a, i) => ({ a, i })).sort((p, q) => p.a.y - q.a.y);
  const placed: Rect[] = [];
  const out: TagPlace[] = anchors.map((a) => ({
    left: a.prefer === "left",
    dy: 0,
  }));
  for (const { a, i } of order) {
    const sides = a.prefer === "left" ? [true, false] : [false, true];
    let best: { place: TagPlace; cost: number } | null = null;
    for (const k of STEPS) {
      for (const left of sides) {
        const place = { left, dy: k * (a.h + 2) };
        const q = rectOf(a, left, place.dy);
        if (!inside(q)) continue;
        const cost = placed.reduce((sum, p) => sum + overlap(p, q), 0);
        if (!best || cost < best.cost) best = { place, cost };
        if (cost === 0) break;
      }
      if (best?.cost === 0) break;
    }
    const place = best?.place ?? { left: a.prefer === "left", dy: 0 };
    out[i] = place;
    placed.push(rectOf(a, place.left, place.dy));
  }
  return out;
}

/**
 * Lays out the tags under `root` (`[data-cb-tag]`), given each jewel's
 * centre by number, in a window `width` by `height`. Every size is read
 * before any tag moves, so it costs one layout.
 */
export function layTags(
  root: ParentNode,
  centre: (n: number) => { x: number; y: number } | null,
  width: number,
  height: number
) {
  const els: { el: HTMLElement; a: TagAnchor }[] = [];
  for (const el of root.querySelectorAll<HTMLElement>("[data-cb-tag]")) {
    const at = centre(Number(el.dataset.cbTag));
    if (!at) continue;
    const b = el.querySelector("b");
    const size = { w: b?.offsetWidth ?? 60, h: b?.offsetHeight ?? 16 };
    const prefer = el.dataset.prefer === "left" ? "left" : "right";
    els.push({ el, a: { ...at, ...size, prefer } });
  }
  const places = placeTags(
    els.map(({ a }) => a),
    width,
    height
  );
  els.forEach(({ el, a }, i) => {
    const place = places[i];
    if (!place) return;
    el.style.left = `${a.x.toFixed(1)}px`;
    el.style.top = `${a.y.toFixed(1)}px`;
    el.style.translate = `${place.left ? `calc(-100% - ${TAG_GAP}px)` : `${TAG_GAP}px`} calc(-50% + ${place.dy.toFixed(1)}px)`;
    // The leader runs from the tag's near edge back to its jewel.
    const leader = el.querySelector<HTMLElement>("[data-leader]");
    if (leader) {
      const vx = place.left ? TAG_GAP : -TAG_GAP;
      const vy = -place.dy;
      leader.style.left = place.left ? "100%" : "0";
      leader.style.width = `${Math.hypot(vx, vy).toFixed(1)}px`;
      leader.style.rotate = `${Math.atan2(vy, vx).toFixed(3)}rad`;
    }
  });
}
