/** A pin's label box on screen, at its natural place over its piece. */
export type LabelBox = { x: number; y: number; w: number; h: number };

/**
 * How far each pin must rise so no two labels overlap: working up from the
 * lowest on screen (the nearest pieces), a label that would cover one
 * already placed climbs above it. Returns the rise for each box, in order.
 */
export function stackLabels(boxes: readonly LabelBox[], gap = 2): number[] {
  const order = boxes
    .map((box, i) => ({ box, i }))
    .sort((a, b) => b.box.y - a.box.y);
  const placed: LabelBox[] = [];
  const rise = boxes.map(() => 0);
  for (const { box, i } of order) {
    let y = box.y;
    for (let moved = true; moved;) {
      moved = false;
      for (const p of placed) {
        const across = box.x < p.x + p.w && p.x < box.x + box.w;
        const over = y < p.y + p.h + gap && p.y < y + box.h + gap;
        if (across && over) {
          y = p.y - box.h - gap;
          moved = true;
        }
      }
    }
    placed.push({ ...box, y });
    rise[i] = box.y - y;
  }
  return rise;
}
