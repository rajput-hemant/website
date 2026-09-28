/**
 * Where a pen plotting a `w` x `h` rectangle's outline is after `t` (0..1)
 * of it: from the bottom-left corner along the bottom edge, then up, across
 * the top and back down, the order the revision cloud's linework is drawn in.
 */
export function penAt(t: number, w: number, h: number): [number, number] {
  let d = Math.min(1, Math.max(0, t)) * 2 * (w + h);
  const edges: [number, number, number, number][] = [
    [-w / 2, -h / 2, 1, 0],
    [w / 2, -h / 2, 0, 1],
    [w / 2, h / 2, -1, 0],
    [-w / 2, h / 2, 0, -1],
  ];
  for (const [x, y, ux, uy] of edges) {
    const len = ux ? w : h;
    if (d <= len) return [x + ux * d, y + uy * d];
    d -= len;
  }
  return [-w / 2, -h / 2];
}
