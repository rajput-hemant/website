// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Part } from "../../workshop";
import { attachBargraph } from "../bargraph";
import { attachKeySwitch, SHAKE, shakeAt } from "../keyswitch";
import { attachLamp } from "../lamp";
import { attachMeter, needleAngle, SWEEP } from "../meter";
import { attachPatch, SEAT } from "../patch";
import { attachPlate } from "../plate";
import { attachPrinthead, carriageX } from "../printhead";
import { attachPushButton } from "../pushbutton";
import { attachReels, packs } from "../reels";
import { attachRoll } from "../roll";
import { attachRotary, rotaryAngle } from "../rotary";
import { attachScrews } from "../screws";
import { attachSpindle } from "../spindle";
import { attachToggles } from "../toggle";

const mounted: Part[] = [];
const kicks = vi.fn<() => void>();
const SIZE = { w: 120, h: 80 };

// The bench is a real WebGL engine; here each part is stepped by hand.
vi.mock("../../workshop", async (original) => {
  const real = await original<typeof import("../../workshop")>();
  return {
    ...real,
    mount: (_host: HTMLElement, part: Part) => {
      part.stage.size.w = SIZE.w;
      part.stage.size.h = SIZE.h;
      part.resize?.(SIZE.w, SIZE.h);
      part.paint();
      mounted.push(part);
      return { kick: kicks, detach: () => {} };
    },
  };
});

const options = { tier: 2 as const, onLost: () => {} };
const host = () => document.createElement("div");
const last = () => {
  const part = mounted.at(-1);
  if (!part) throw new Error("nothing mounted");
  return part;
};

/** Frames until the part rests (capped). */
function settle(part: Part, cap = 600) {
  for (let i = 1; i <= cap; i++) if (!part.step(1 / 60)) return i;
  return cap;
}

beforeEach(() => {
  mounted.length = 0;
  kicks.mockClear();
  document.documentElement.dataset.motion = "on";
  // jsdom has no 2D canvas; the parts' textures cope with none.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("every part", () => {
  const attachers: [string, () => unknown][] = [
    ["lamp", () => attachLamp(host(), options, "t-lamp", "signal")],
    [
      "screws",
      () => attachScrews(host(), options, "t", { inset: [9, 9], radius: 4 }),
    ],
    ["reels", () => attachReels(host(), options, 0.5)],
    ["rotary", () => attachRotary(host(), options, 0)],
    [
      "toggles",
      () =>
        attachToggles(
          host(),
          options,
          "t",
          { count: 3, axis: "y", pitch: 36 },
          [1, 0, -1]
        ),
    ],
    [
      "bargraph",
      () => attachBargraph(host(), options, "t", [true, false, false]),
    ],
    ["meter", () => attachMeter(host(), options, "t", 0.4)],
    ["printhead", () => attachPrinthead(host(), options, 0.5)],
    ["spindle", () => attachSpindle(host(), options, 2)],
    [
      "patch",
      () =>
        attachPatch(host(), options, "t", {
          out: 0.1,
          sockets: [0.4, 0.8],
          row: 30,
        }),
    ],
    ["plate", () => attachPlate(host(), options)],
    ["roll", () => attachRoll(host(), options)],
    ["push button", () => attachPushButton(host(), options, "t")],
    ["key switch", () => attachKeySwitch(host(), options, false)],
  ];

  it.each(attachers)(
    "%s mounts at rest, so an untouched page renders one frame",
    (_, attach) => {
      attach();
      const part = last();
      // The first step may settle a colour fade; after that it is still.
      settle(part);
      expect(part.step(1 / 60)).toBe(false);
    }
  );
});

describe("lamp", () => {
  it("fades its core on a tone change, then rests", () => {
    const lamp = attachLamp(host(), options, "t-fade", "off");
    const part = last();
    settle(part);
    lamp.set("signal");
    expect(kicks).toHaveBeenCalled();
    expect(part.step(1 / 60)).toBe(true);
    expect(settle(part)).toBeLessThan(40);
  });

  it("snaps with motion off", () => {
    document.documentElement.dataset.motion = "off";
    const lamp = attachLamp(host(), options, "t-snap", "off");
    const part = last();
    lamp.set("alarm");
    lamp.lean(1, -1);
    expect(part.step(1 / 60)).toBe(false);
  });
});

describe("reels", () => {
  it("keeps the tape's area as it winds", () => {
    for (const f of [0, 0.3, 0.7, 1]) {
      const [a, b] = packs(f);
      const [a0, b0] = packs(0);
      expect(a * a + b * b).toBeCloseTo(a0 * a0 + b0 * b0, 6);
    }
    expect(packs(1)[1]).toBeGreaterThan(packs(0)[1]);
  });

  it("spins until the tape reaches the new place", () => {
    const reels = attachReels(host(), options, 0.2);
    const part = last();
    settle(part);
    reels.wind(0.9);
    expect(part.step(1 / 60)).toBe(true);
    expect(settle(part)).toBeLessThan(120);
  });
});

describe("rotary and meter angles", () => {
  it("centres the rotary's positions 30 degrees apart", () => {
    expect(rotaryAngle(0, 3)).toBe(-30);
    expect(rotaryAngle(2, 3)).toBe(30);
    expect(rotaryAngle(0, 1)).toBe(0);
  });

  it("sweeps the needle across its arc and clamps", () => {
    expect(needleAngle(0)).toBe(-SWEEP);
    expect(needleAngle(1)).toBe(SWEEP);
    expect(needleAngle(2)).toBe(SWEEP);
  });
});

describe("meter", () => {
  it("trembles only while asked to", () => {
    const meter = attachMeter(host(), options, "t-tremble", 0);
    const part = last();
    settle(part);
    meter.tremble(true);
    for (let i = 0; i < 30; i++) expect(part.step(1 / 60)).toBe(true);
    meter.tremble(false);
    expect(settle(part)).toBeLessThan(60);
  });

  it("does not tremble with motion off", () => {
    document.documentElement.dataset.motion = "off";
    const meter = attachMeter(host(), options, "t-still", 0);
    const part = last();
    meter.tremble(true);
    meter.bump();
    expect(part.step(1 / 60)).toBe(false);
  });
});

describe("key switch", () => {
  it("shakes about zero, within 4 degrees, for 240ms", () => {
    expect(shakeAt(0)).toBe(0);
    expect(shakeAt(SHAKE.seconds)).toBe(0);
    for (let t = 0; t < SHAKE.seconds; t += 0.005) {
      expect(Math.abs(shakeAt(t))).toBeLessThanOrEqual(SHAKE.degrees);
    }
  });

  it("turns open, and a shake runs its course then rests", () => {
    const key = attachKeySwitch(host(), options, false);
    const part = last();
    key.set(true);
    expect(settle(part)).toBeLessThan(90);
    key.shake();
    let frames = 0;
    while (part.step(1 / 60) && frames < 200) frames++;
    expect(frames).toBeGreaterThanOrEqual(Math.floor(SHAKE.seconds * 60) - 1);
    expect(frames).toBeLessThan(40);
  });
});

describe("print head", () => {
  it("strikes once it arrives, then rests", () => {
    const head = attachPrinthead(host(), options, 0);
    const part = last();
    settle(part);
    head.go(1);
    const frames = settle(part);
    // The journey plus the 160ms strike.
    expect(frames).toBeGreaterThan(10);
    expect(frames).toBeLessThan(120);
    expect(carriageX(1, SIZE.w)).toBe((SIZE.w - 30) / 2);
  });
});

describe("patch bay", () => {
  it("seats the plug in the nearest socket, or swings it home", () => {
    const bay = attachPatch(host(), options, "t-seat", {
      out: 0.1,
      sockets: [0.4, 0.8],
      row: 30,
    });
    const part = last();
    settle(part);
    const plug = bay.plug();
    expect(bay.grab(plug.x + 100, plug.y)).toBe(false);
    expect(bay.grab(plug.x, plug.y)).toBe(true);
    // The second socket: 0.8 across a 120px slot, 30px down from its top.
    const socket = { x: (0.8 - 0.5) * SIZE.w, y: SIZE.h / 2 - 30 };
    bay.move(socket.x + SEAT / 2, socket.y);
    expect(bay.release()).toBe(1);
    settle(part);
    expect(bay.plug().x).toBeCloseTo(socket.x, 0);

    expect(bay.grab(socket.x, socket.y)).toBe(true);
    bay.move(0, -30);
    expect(bay.release()).toBeNull();
    settle(part);
    expect(bay.plug()).toEqual(plug);
  });
});
