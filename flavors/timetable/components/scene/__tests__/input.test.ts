// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { input } from "@/lib/scene/store";

import { bindInput } from "../input";

const ring = vi.hoisted(() => vi.fn((_dragX: number, _speed: number) => true));
vi.mock("@/flavors/timetable/lib/sound/voices", () => ({ playRing: ring }));

/** jsdom has no PointerEvent: an Event carrying the fields bindInput reads. */
function pointer(type: string, fields: { x: number; t: number; y?: number }) {
  const e = new Event(type);
  Object.defineProperties(e, {
    clientX: { value: fields.x },
    clientY: { value: fields.y ?? 50 },
    timeStamp: { value: fields.t },
    pointerId: { value: 1 },
    button: { value: 0 },
    pointerType: { value: "touch" },
  });
  return e;
}

let host: HTMLElement;
let off: () => void;

beforeEach(() => {
  host = document.createElement("div");
  host.setPointerCapture = () => {};
  document.body.append(host);
  off = bindInput(host);
  ring.mockClear();
});

afterEach(() => {
  off();
  host.remove();
});

/** A horizontal swing: down, then 60px across in 12px steps, 16ms apart. */
function swing() {
  host.dispatchEvent(pointer("pointerdown", { x: 100, t: 0 }));
  for (let i = 1; i <= 5; i++) {
    host.dispatchEvent(pointer("pointermove", { x: 100 + i * 12, t: i * 16 }));
  }
}

describe("the indicator's pointer input", () => {
  it("rings the rods when a touch swing is let go", () => {
    swing();
    expect(input.dragging).toBe(true);
    host.dispatchEvent(pointer("pointerup", { x: 160, t: 90 }));
    expect(ring).toHaveBeenCalledTimes(1);
    const [dragX, speed] = ring.mock.calls[0] ?? [];
    expect(dragX).toBe(60);
    expect(speed).toBeCloseTo(12 / 16);
    expect(input.dragging).toBe(false);
    expect(input.dragX).toBe(0);
  });

  it("keeps vertical movement for page scroll on touch", () => {
    host.dispatchEvent(pointer("pointerdown", { x: 100, t: 0 }));
    host.dispatchEvent(pointer("pointermove", { x: 140, y: 120, t: 16 }));
    expect(input.dragX).toBe(40);
    expect(input.dragY).toBe(0);
  });

  it("releases at rest after a hold, and stays quiet on a cancel or a tap", () => {
    swing();
    host.dispatchEvent(pointer("pointerup", { x: 160, t: 400 }));
    expect(ring.mock.calls[0]?.[1]).toBe(0);

    ring.mockClear();
    swing();
    host.dispatchEvent(pointer("pointercancel", { x: 160, t: 90 }));
    expect(ring).not.toHaveBeenCalled();

    host.dispatchEvent(pointer("pointerdown", { x: 100, t: 0 }));
    host.dispatchEvent(pointer("pointerup", { x: 101, t: 20 }));
    expect(ring).not.toHaveBeenCalled();
  });
});
