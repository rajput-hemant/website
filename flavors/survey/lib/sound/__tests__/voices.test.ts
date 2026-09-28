// @vitest-environment jsdom

import {
  DATUM_HZ,
  pingDetune,
  tallyDetune,
  voiceFor,
  VOICES,
} from "@/flavors/survey/lib/sound/voices";
import { afterEach, describe, expect, it } from "vitest";

import type { Voice } from "@/lib/sound";

const click = new MouseEvent("click", { detail: 1 });

function mount(html: string): Element {
  document.body.innerHTML = html;
  const el = document.querySelector("[data-target]");
  if (!el) throw new Error("no [data-target] in fixture");
  return el;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("voiceFor", () => {
  it("clicks links into a detent and clamps buttons", () => {
    const link = mount('<a href="/work" data-target>Work</a>');
    expect(voiceFor(link, click)).toBe(VOICES.clickStop);
    const button = mount("<button data-target>Filter</button>");
    expect(voiceFor(button, click)).toBe(VOICES.clamp);
    const role = mount('<span role="button" data-target>');
    expect(voiceFor(role, click)).toBe(VOICES.clamp);
  });

  it("runs the bubble in the direction the click turns the switch", () => {
    // ClickSound hears the click in the capture phase, before the toggle.
    const off = mount('<span role="switch" aria-checked="false" data-target>');
    expect(voiceFor(off, click)).toBe(VOICES.bubbleOn);
    const on = mount('<span role="switch" aria-checked="true" data-target>');
    expect(voiceFor(on, click)).toBe(VOICES.bubbleOff);
  });

  it("raises the bubble for a new option, and stays quiet on the chosen one", () => {
    const next = mount('<span role="radio" aria-checked="false" data-target>');
    expect(voiceFor(next, click)).toBe(VOICES.bubbleOn);
    const same = mount('<span role="radio" aria-checked="true" data-target>');
    expect(voiceFor(same, click)).toBeNull();
  });

  it("honours data-voice, silent on touch, and keeps the command menu quiet", () => {
    const theme = mount('<button data-voice="sheetTurn" data-target>');
    expect(voiceFor(theme, click)).toBe(VOICES.sheetTurn);
    const touch = new PointerEvent("click", { pointerType: "touch" });
    expect(voiceFor(theme, touch)).toBeNull();
    const none = mount('<button data-voice="none" data-target>');
    expect(voiceFor(none, click)).toBeNull();
    const unknown = mount('<button data-voice="stamp" data-target>');
    expect(voiceFor(unknown, click)).toBeNull();
    const menu = mount('<div cmdk-root><a href="/" data-target>Home</a></div>');
    expect(voiceFor(menu, click)).toBeNull();
    const plain = mount("<div data-target>");
    expect(voiceFor(plain, click)).toBeNull();
  });
});

describe("recipes", () => {
  const entries: [string, Voice][] = Object.entries(VOICES);

  it.each(entries)("%s is a playable voice", (_name, voice) => {
    expect(voice.layers.length).toBeGreaterThan(0);
    // The engine allows at most 4 live click sources.
    expect(voice.layers.length).toBeLessThanOrEqual(4);
    expect(voice.gain).toBeGreaterThan(0);
    // The instrument case never peaks past 0.12 (audit appendix E §5).
    expect(voice.gain).toBeLessThanOrEqual(0.12);
    for (const layer of voice.layers) {
      // Exponential ramps need strictly positive endpoints.
      for (const hz of [...layer.freq, ...(layer.filter?.freq ?? [])]) {
        expect(Number.isFinite(hz) && hz > 0).toBe(true);
      }
      expect(layer.gain).toBeGreaterThan(0);
      expect(layer.gain).toBeLessThanOrEqual(1);
      expect(layer.attack).toBeGreaterThan(0);
      expect(layer.decay).toBeGreaterThan(layer.attack);
      expect(layer.decay).toBeLessThanOrEqual(0.2);
    }
  });

  it("glides the bubble up for on and down for off", () => {
    expect(VOICES.bubbleOn.layers[0]?.freq).toEqual([660, 990]);
    expect(VOICES.bubbleOff.layers[0]?.freq).toEqual([990, 660]);
  });

  it("gives only the current role's ping its octave", () => {
    const tones = (voice: Voice) => voice.layers.map((l) => l.freq[0]);
    expect(tones(VOICES.ping)).toEqual([DATUM_HZ, DATUM_HZ * 1.5]);
    expect(tones(VOICES.pingCurrent)).toEqual([
      DATUM_HZ,
      DATUM_HZ * 1.5,
      DATUM_HZ * 2,
    ]);
    expect(tones(VOICES.pingSite)[0]).toBeCloseTo(1046.5);
  });
});

describe("pingDetune", () => {
  it("rises one octave per 24 months from the datum", () => {
    expect(pingDetune(0)).toBe(1);
    expect(pingDetune(12)).toBeCloseTo(Math.SQRT2);
    expect(pingDetune(24)).toBeCloseTo(2);
    expect(pingDetune(48)).toBeCloseTo(4);
    expect(DATUM_HZ * pingDetune(24)).toBeCloseTo(1046.5);
  });

  it("clamps heights outside 0 to 72 months and ignores bad data", () => {
    expect(pingDetune(-6)).toBe(1);
    expect(pingDetune(200)).toBeCloseTo(8);
    expect(pingDetune(Number.NaN)).toBe(1);
  });
});

describe("tallyDetune", () => {
  it("steps a minor third per role running", () => {
    expect(tallyDetune(0)).toBe(1);
    expect(tallyDetune(1)).toBeCloseTo(2 ** (3 / 12));
    expect(tallyDetune(4)).toBeCloseTo(2);
    expect(tallyDetune(99)).toBeCloseTo(4);
    expect(tallyDetune(Number.NaN)).toBe(1);
  });
});
