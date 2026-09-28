// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import type { Voice } from "@/lib/sound";

import { paperFlex, pressVoices, voiceFor } from "../voices";

function element(html: string, selector: string): Element {
  document.body.innerHTML = html;
  const found = document.querySelector(selector);
  if (!found) throw new Error(`missing ${selector}`);
  return found;
}

describe("voiceFor", () => {
  it("keeps the plate swap silent on touch", () => {
    const toggle = element(
      '<button data-voice="plate">Plate</button>',
      "button"
    );
    const touch = new PointerEvent("click", { pointerType: "touch" });
    const mouse = new PointerEvent("click", { pointerType: "mouse" });
    expect(voiceFor(toggle, touch)).toBeNull();
    expect(voiceFor(toggle, mouse)).toBe(pressVoices.plate);
  });

  it("kisses the platen for links and stamps buttons, switches and radios", () => {
    expect(voiceFor(element('<a href="/work">Work</a>', "a"))).toBe(
      pressVoices.platen
    );
    expect(voiceFor(element("<button>Go</button>", "button"))).toBe(
      pressVoices.stamp
    );
    for (const role of ["button", "switch", "radio"]) {
      expect(voiceFor(element(`<div role="${role}"></div>`, "div"))).toBe(
        pressVoices.stamp
      );
    }
  });

  it("resolves a control from inside it", () => {
    expect(voiceFor(element('<a href="/"><span>Home</span></a>', "span"))).toBe(
      pressVoices.platen
    );
  });

  it("honours data-voice, and stays silent for none or an unknown name", () => {
    expect(
      voiceFor(element('<button data-voice="plate">Plate</button>', "button"))
    ).toBe(pressVoices.plate);
    expect(
      voiceFor(element('<a href="/" data-voice="stamp">Home</a>', "a"))
    ).toBe(pressVoices.stamp);
    expect(
      voiceFor(element('<button data-voice="none">Copy</button>', "button"))
    ).toBeNull();
    expect(
      voiceFor(element('<button data-voice="tick">Tick</button>', "button"))
    ).toBeNull();
    expect(
      voiceFor(element('<button data-voice="toString">x</button>', "button"))
    ).toBeNull();
  });

  it("is silent for anything that is not a control", () => {
    expect(voiceFor(element("<p>Text</p>", "p"))).toBeNull();
  });
});

describe("press recipes", () => {
  const voices: [string, Voice][] = Object.entries(pressVoices);

  it.each(voices)("%s is quiet, short and safe to ramp", (_name, voice) => {
    expect(voice.gain).toBeGreaterThan(0);
    expect(voice.gain).toBeLessThanOrEqual(0.2);
    expect(voice.layers.length).toBeGreaterThan(0);
    // The click limiter allows at most 4 live sources.
    expect(voice.layers.length).toBeLessThanOrEqual(4);
    for (const layer of voice.layers) {
      // Exponential ramps need strictly positive values.
      expect(layer.freq.every((f) => f > 0)).toBe(true);
      expect(layer.filter?.freq.every((f) => f > 0) ?? true).toBe(true);
      expect(layer.gain).toBeGreaterThan(0);
      expect(layer.gain).toBeLessThanOrEqual(1);
      expect(layer.attack).toBeGreaterThan(0);
      expect(layer.attack).toBeLessThan(layer.decay);
      expect(layer.decay).toBeLessThanOrEqual(0.2);
      expect((layer.delay ?? 0) + layer.decay).toBeLessThanOrEqual(0.25);
    }
  });

  it("keeps the stamp low, so it never reads as Drawing Set's", () => {
    const [body] = pressVoices.stamp.layers;
    expect(body?.freq).toEqual([120, 58]);
  });

  it("keeps the paper flex loop quiet", () => {
    expect(paperFlex.gain).toBeLessThanOrEqual(0.05);
    expect(paperFlex.filter?.freq).toBeGreaterThan(0);
  });
});
