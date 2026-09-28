import {
  encodeBoard,
  jewelItem,
  litJewel,
  parseBoard,
} from "@/flavors/calibre/lib/scene/poses";
import { describe, expect, it } from "vitest";

describe("litJewel", () => {
  const board = parseBoard(encodeBoard({ jewels: 9, lit: 3 }));

  it("lights the page's own jewel when no card is pointed at", () => {
    expect(litJewel(board, null)).toBe(3);
    expect(litJewel(board, "piece:other")).toBe(3);
  });

  it("lights a hovered card's jewel instead", () => {
    expect(litJewel(board, jewelItem(7))).toBe(7);
  });

  it("ignores a card outside this movement", () => {
    expect(litJewel(board, jewelItem(12))).toBe(3);
    expect(litJewel(board, jewelItem(0))).toBe(3);
  });
});
