/**
 * Two-link planar reach, as in a drafting machine's parallel arm: from a
 * base at the origin, links `a` then `b` reach towards (`x`, `y`). Returns
 * the elbow and the tip; a target out of span is clamped onto it, so the
 * tip always lies at the end of link `b`. `side` picks which way the elbow
 * bends (1 or -1).
 */
export function reach(
  x: number,
  y: number,
  a: number,
  b: number,
  side: 1 | -1 = 1
): { elbow: [number, number]; tip: [number, number] } {
  const d0 = Math.hypot(x, y);
  const heading = d0 > 1e-9 ? Math.atan2(y, x) : 0;
  const d = Math.min(a + b - 1e-6, Math.max(Math.abs(a - b) + 1e-6, d0));
  const cos = (a * a + d * d - b * b) / (2 * a * d);
  const angle = heading + side * Math.acos(Math.min(1, Math.max(-1, cos)));
  const elbow: [number, number] = [a * Math.cos(angle), a * Math.sin(angle)];
  const tip: [number, number] = [d * Math.cos(heading), d * Math.sin(heading)];
  return { elbow, tip };
}
