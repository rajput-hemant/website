import { placeTags, type TagAnchor } from "@/flavors/calibre/lib/tags";
import { describe, expect, it } from "vitest";

const tag = (patch: Partial<TagAnchor>): TagAnchor => ({
  x: 200,
  y: 200,
  w: 80,
  h: 16,
  prefer: "right",
  ...patch,
});

describe("placeTags", () => {
  it("sets a lone tag on the side it prefers", () => {
    expect(placeTags([tag({ prefer: "left" })], 400, 400)).toEqual([
      { left: true, dy: 0 },
    ]);
  });

  it("turns a tag to the other side rather than leave the window", () => {
    expect(placeTags([tag({ x: 360 })], 400, 400)).toEqual([
      { left: true, dy: 0 },
    ]);
  });

  it("moves a tag that would cover another", () => {
    const [first, second] = placeTags(
      [tag({ y: 200 }), tag({ y: 204 })],
      400,
      400
    );
    expect(first).toEqual({ left: false, dy: 0 });
    expect(second).toEqual({ left: true, dy: 0 });
  });

  it("steps a third tag up or down when both sides are taken", () => {
    const places = placeTags(
      [tag({ y: 200 }), tag({ y: 202 }), tag({ y: 204 })],
      400,
      400
    );
    expect(places[2]?.dy).not.toBe(0);
  });

  it("clears a crowded cluster of seats, as the poster's train and fork", () => {
    // The poster's seats and measured tag sizes at 448px, where the escape
    // wheel's tag once hid under a pallet stone's.
    const anchors = [
      [165.8, 156.6, 70, "right"],
      [226.8, 101.7, 72, "left"],
      [171.9, 226.8, 58, "left"],
      [232.9, 184.1, 78, "left"],
      [95.6, 214.6, 110, "right"],
      [190, 46.2, 32, "left"],
      [141.5, 285.3, 101, "right"],
      [182.5, 199.3, 99, "left"],
      [210, 199.3, 52, "right"],
    ].map(([x, y, w, prefer]) =>
      tag({
        x: Number(x),
        y: Number(y),
        w: Number(w),
        h: 18,
        prefer: prefer === "left" ? "left" : "right",
      })
    );
    const places = placeTags(anchors, 448, 448);
    const rects = anchors.map((a, i) => {
      const p = places[i] ?? { left: false, dy: 0 };
      const x0 = p.left ? a.x - 10 - a.w : a.x + 10;
      const y0 = a.y + p.dy - a.h / 2;
      return { x0, y0, x1: x0 + a.w, y1: y0 + a.h };
    });
    for (const [i, a] of rects.entries())
      for (const b of rects.slice(i + 1))
        expect(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1).toBe(
          false
        );
  });
});
